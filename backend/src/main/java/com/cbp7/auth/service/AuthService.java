package com.cbp7.auth.service;

import com.cbp7.auth.dto.LoginRequest;
import com.cbp7.auth.dto.LoginResponse;
import com.cbp7.auth.dto.RegisterRequest;
import com.cbp7.auth.dto.UserResponse;
import com.cbp7.auth.entity.AuthProvider;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.identity.UserIdentityResolver;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.auth.security.JwtProvider;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ForbiddenException;
import com.cbp7.common.exception.InvalidCredentialsException;
import com.cbp7.common.exception.UnauthorizedException;
import com.cbp7.notification.event.NotificationEventPublisher;
import com.cbp7.notification.event.StudentRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final UserIdentityResolver userIdentityResolver;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final NotificationEventPublisher notificationEventPublisher;

    @Transactional
    public String register(RegisterRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Registration request cannot be null");
        }

        String studentId = request.studentId() != null ? request.studentId().trim().toLowerCase() : "";
        String email = request.studentEmail() != null ? request.studentEmail().trim().toLowerCase() : "";
        String name = request.name() != null ? request.name().trim() : "";
        String phoneNumber = request.phoneNumber() != null ? request.phoneNumber().trim() : "";
        String password = request.password() != null ? request.password().trim() : "";
        String confirmPassword = request.confirmPassword() != null && !request.confirmPassword().isBlank()
                ? request.confirmPassword().trim()
                : password;

        log.info("Register request received for student ID: {}, email: {}", studentId, email);

        if (studentId.isEmpty() || email.isEmpty() || name.isEmpty() || password.isEmpty()) {
            throw new IllegalArgumentException("All required fields must be provided");
        }

        if (!password.equals(confirmPassword)) {
            throw new IllegalArgumentException("Password and confirm password do not match");
        }

        if (userRepository.existsByStudentId(studentId)) {
            log.warn("Registration failed: Student ID {} is already registered", studentId);
            throw new DuplicateResourceException("Student ID is already registered");
        }

        if (userRepository.existsByEmail(email)) {
            log.warn("Registration failed: Email {} is already registered", email);
            throw new DuplicateResourceException("Email is already registered");
        }

        log.info("Saving new user to database: {}", studentId);
        User user = User.builder()
                .studentId(studentId)
                .email(email)
                .name(name)
                .phoneNumber(phoneNumber)
                .password(passwordEncoder.encode(password))
                .role(Role.ROLE_STUDENT)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);
        String userId = savedUser != null && savedUser.getId() != null ? savedUser.getId().toString() : "";
        log.info("User created successfully with ID: {} and student ID: {}", userId, studentId);

        if (notificationEventPublisher != null) {
            try {
                log.info("Publishing StudentRegisteredEvent for student ID: {}", studentId);
                notificationEventPublisher.publish(new StudentRegisteredEvent(
                        studentId,
                        email,
                        name,
                        userId
                ));
            } catch (Exception e) {
                log.error("Failed to publish StudentRegisteredEvent for student ID: {}", studentId, e);
            }
        }

        return "User registered successfully";
    }

    public LoginResponse login(LoginRequest request) {
        if (request == null || request.getEffectiveIdentifier().isBlank() || request.password() == null) {
            throw new IllegalArgumentException("Student ID / email and password must be provided");
        }

        String rawIdentifier = request.getEffectiveIdentifier();
        String rawPassword = request.password().trim();

        User user = findUserByIdentifier(rawIdentifier)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid Student ID/email or password"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid Student ID/email or password");
        }

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new ForbiddenException("Account is disabled");
        }

        String token = jwtProvider.generateToken(user);

        return new LoginResponse(
                token,
                user.getStudentId(),
                user.getName(),
                user.getRole().name(),
                user.getPermissions() != null ? user.getPermissions() : java.util.Set.of()
        );
    }

    public Optional<User> findUserByIdentifier(String identifier) {
        return userIdentityResolver.findUserByIdentifier(identifier);
    }

    @Transactional
    public String processGoogleUser(String email, String name, String sub) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Google account email must not be null or empty");
        }

        String cleanEmail = email.trim().toLowerCase();
        String cleanName = name != null && !name.isBlank() ? name.trim() : cleanEmail.split("@")[0];

        Optional<User> existingUserOpt = userRepository.findByEmailIgnoreCase(cleanEmail);
        User user;

        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            if (!Boolean.TRUE.equals(user.getEnabled())) {
                throw new ForbiddenException("Account is disabled");
            }
            if (user.getAuthProvider() == null || user.getAuthProvider() == AuthProvider.LOCAL) {
                user.setAuthProvider(AuthProvider.GOOGLE);
            }
            if (user.getProviderId() == null || user.getProviderId().isBlank()) {
                user.setProviderId(sub);
            }
            user = userRepository.save(user);
            log.info("Existing CBP user authenticated through Google: {}", cleanEmail);
        } else {
            String rawPrefix = cleanEmail.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
            if (rawPrefix.isBlank()) {
                rawPrefix = "student";
            }
            String baseStudentId = "g_" + rawPrefix;
            String studentId = baseStudentId;
            int counter = 1;
            while (userRepository.existsByStudentId(studentId) || userRepository.existsByStudentIdIgnoreCase(studentId)) {
                studentId = baseStudentId + counter++;
            }

            Set<String> defaultPermissions = new java.util.HashSet<>(java.util.List.of("STUDENT_VIEW", "ATTENDANCE_VIEW"));

            user = User.builder()
                    .studentId(studentId)
                    .email(cleanEmail)
                    .name(cleanName)
                    .role(Role.ROLE_STUDENT)
                    .enabled(true)
                    .authProvider(AuthProvider.GOOGLE)
                    .providerId(sub)
                    .password(null)
                    .permissions(defaultPermissions)
                    .build();

            user = userRepository.save(user);
            log.info("Creating new CBP student account from Google: email={}, studentId={}", cleanEmail, studentId);

            if (notificationEventPublisher != null) {
                try {
                    String userId = user.getId() != null ? user.getId().toString() : "";
                    notificationEventPublisher.publish(new StudentRegisteredEvent(
                            studentId,
                            cleanEmail,
                            cleanName,
                            userId
                    ));
                } catch (Exception e) {
                    log.error("Failed to publish StudentRegisteredEvent for Google user: {}", cleanEmail, e);
                }
            }
        }

        return jwtProvider.generateToken(user);
    }

    public String logout() {
        return "Logged out successfully";
    }

    public UserResponse getCurrentUser(User user) {
        if (user == null) {
            throw new UnauthorizedException("User is not authenticated");
        }

        return new UserResponse(
                user.getStudentId(),
                user.getEmail(),
                user.getName(),
                user.getPhoneNumber(),
                user.getRole().name(),
                user.getPermissions() != null ? user.getPermissions() : java.util.Set.of()
        );
    }
}

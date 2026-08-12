package com.cbp7.identity.auth.service.impl;

import com.cbp7.identity.auth.dto.request.LoginRequest;
import com.cbp7.identity.auth.dto.request.ProfileUpdateRequest;
import com.cbp7.identity.auth.dto.request.RegisterRequest;
import com.cbp7.identity.auth.dto.response.LoginResponse;
import com.cbp7.identity.auth.dto.response.UserResponse;
import com.cbp7.identity.auth.entity.AuthProvider;
import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.identity.UserIdentityResolver;
import com.cbp7.identity.auth.mapper.AuthMapper;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.identity.auth.security.JwtProvider;
import com.cbp7.identity.auth.service.AuthService;
import com.cbp7.identity.auth.validation.AuthValidator;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ForbiddenException;
import com.cbp7.common.exception.InvalidCredentialsException;
import com.cbp7.platform.notification.event.NotificationEventPublisher;
import com.cbp7.platform.notification.event.StudentRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserIdentityResolver userIdentityResolver;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final NotificationEventPublisher notificationEventPublisher;
    private final AuthValidator authValidator;
    private final AuthMapper authMapper;

    @Override
    @Transactional
    public String register(RegisterRequest request) {
        String studentId = request != null && request.studentId() != null ? request.studentId().trim().toLowerCase() : "";
        String email = request != null && request.studentEmail() != null ? request.studentEmail().trim().toLowerCase() : "";

        log.info("Register request received for student ID: {}, email: {}", studentId, email);

        boolean studentIdExists = userRepository.existsByStudentId(studentId);
        boolean emailExists = userRepository.existsByEmail(email);
        authValidator.validateRegistration(request, studentIdExists, emailExists);

        User savedUser = createUserEntity(request, studentId, email);
        publishStudentRegistrationEvent(savedUser, studentId, email);

        return "User registered successfully";
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        authValidator.validateLoginRequest(request);

        String rawIdentifier = request.getEffectiveIdentifier();
        String rawPassword = request.password().trim();

        User user = findUserByIdentifier(rawIdentifier)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid Student ID/email or password"));

        authValidator.validateUserForLogin(user, rawPassword, passwordEncoder);

        String token = jwtProvider.generateToken(user);
        return authMapper.toLoginResponse(user, token);
    }

    @Override
    public Optional<User> findUserByIdentifier(String identifier) {
        return userIdentityResolver.findUserByIdentifier(identifier);
    }

    @Override
    @Transactional
    public String processGoogleUser(String email, String name, String sub) {
        authValidator.validateGoogleEmail(email);

        String cleanEmail = email.trim().toLowerCase();
        String cleanName = name != null && !name.isBlank() ? name.trim() : cleanEmail.split("@")[0];

        Optional<User> existingUserOpt = userRepository.findByEmailIgnoreCase(cleanEmail);
        User user = existingUserOpt.isPresent()
                ? updateExistingGoogleUser(existingUserOpt.get(), cleanEmail, sub)
                : createNewGoogleUser(cleanEmail, cleanName, sub);

        return jwtProvider.generateToken(user);
    }

    @Override
    public String logout() {
        return "Logged out successfully";
    }

    @Override
    public UserResponse getCurrentUser(User user) {
        authValidator.validateAuthenticatedUser(user);

        User freshUser = user.getId() != null
                ? userRepository.findById(user.getId()).orElse(user)
                : user;

        return authMapper.toUserResponse(freshUser);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(User currentUser, ProfileUpdateRequest request) {
        authValidator.validateProfileUpdate(currentUser, request);

        String cleanStudentId = request.studentId().trim().toLowerCase();

        userRepository.findByStudentIdIgnoreCase(cleanStudentId).ifPresent(otherUser -> {
            if (!otherUser.getId().equals(currentUser.getId())) {
                throw new DuplicateResourceException("Student ID is already registered to another account");
            }
        });

        currentUser.setStudentId(cleanStudentId);
        if (request.phoneNumber() != null && !request.phoneNumber().isBlank()) {
            currentUser.setPhoneNumber(request.phoneNumber().trim());
        }

        User updatedUser = userRepository.save(currentUser);
        log.info("Profile updated for user email={}: studentId={}", updatedUser.getEmail(), cleanStudentId);

        return getCurrentUser(updatedUser);
    }

    // --- Private Helper Methods ---

    private User createUserEntity(RegisterRequest request, String studentId, String email) {
        String name = request.name() != null ? request.name().trim() : "";
        String phoneNumber = request.phoneNumber() != null ? request.phoneNumber().trim() : "";
        String password = request.password() != null ? request.password().trim() : "";

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
        String userId = savedUser.getId() != null ? savedUser.getId().toString() : "";
        log.info("User created successfully with ID: {} and student ID: {}", userId, studentId);
        return savedUser;
    }

    private void publishStudentRegistrationEvent(User user, String studentId, String email) {
        if (notificationEventPublisher != null) {
            try {
                String userId = user.getId() != null ? user.getId().toString() : "";
                log.info("Publishing StudentRegisteredEvent for student ID: {}", studentId);
                notificationEventPublisher.publish(new StudentRegisteredEvent(
                        studentId,
                        email,
                        user.getName(),
                        userId
                ));
            } catch (Exception e) {
                log.error("Failed to publish StudentRegisteredEvent for student ID: {}", studentId, e);
            }
        }
    }

    private User updateExistingGoogleUser(User user, String cleanEmail, String sub) {
        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new ForbiddenException("Account is disabled");
        }
        if (user.getAuthProvider() == null || user.getAuthProvider() == AuthProvider.LOCAL) {
            user.setAuthProvider(AuthProvider.GOOGLE);
        }
        if (user.getProviderId() == null || user.getProviderId().isBlank()) {
            user.setProviderId(sub);
        }
        User updated = userRepository.save(user);
        log.info("Existing CBP user authenticated through Google: {}", cleanEmail);
        return updated;
    }

    private User createNewGoogleUser(String cleanEmail, String cleanName, String sub) {
        Set<String> defaultPermissions = new HashSet<>(List.of("STUDENT_VIEW", "ATTENDANCE_VIEW"));

        User user = User.builder()
                .studentId(null)
                .email(cleanEmail)
                .name(cleanName)
                .role(Role.ROLE_STUDENT)
                .enabled(true)
                .authProvider(AuthProvider.GOOGLE)
                .providerId(sub)
                .password(null)
                .permissions(defaultPermissions)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Creating new CBP student account from Google: email={}", cleanEmail);

        publishStudentRegistrationEvent(savedUser, cleanEmail, cleanEmail);
        return savedUser;
    }
}

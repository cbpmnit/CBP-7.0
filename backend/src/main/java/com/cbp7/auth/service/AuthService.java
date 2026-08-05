package com.cbp7.auth.service;

import com.cbp7.auth.dto.LoginRequest;
import com.cbp7.auth.dto.LoginResponse;
import com.cbp7.auth.dto.RegisterRequest;
import com.cbp7.auth.dto.UserResponse;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.auth.security.JwtProvider;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ForbiddenException;
import com.cbp7.common.exception.InvalidCredentialsException;
import com.cbp7.common.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public String register(RegisterRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Registration request cannot be null");
        }

        String studentId = request.studentId() != null ? request.studentId().trim().toLowerCase() : "";
        String email = request.studentEmail() != null ? request.studentEmail().trim().toLowerCase() : "";
        String name = request.name() != null ? request.name().trim() : "";
        String phoneNumber = request.phoneNumber() != null ? request.phoneNumber().trim() : "";
        String password = request.password() != null ? request.password().trim() : "";
        String confirmPassword = request.confirmPassword() != null ? request.confirmPassword().trim() : "";

        if (studentId.isEmpty() || email.isEmpty() || name.isEmpty() || password.isEmpty()) {
            throw new IllegalArgumentException("All required fields must be provided");
        }

        if (!password.equals(confirmPassword)) {
            throw new IllegalArgumentException("Password and confirm password do not match");
        }

        if (userRepository.existsByStudentId(studentId)) {
            throw new DuplicateResourceException("Student ID is already registered");
        }

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already registered");
        }

        User user = User.builder()
                .studentId(studentId)
                .email(email)
                .name(name)
                .phoneNumber(phoneNumber)
                .password(passwordEncoder.encode(password))
                .role(Role.ROLE_STUDENT)
                .enabled(true)
                .build();

        userRepository.save(user);

        return "User registered successfully";
    }

    public LoginResponse login(LoginRequest request) {
        if (request == null || request.studentId() == null || request.password() == null) {
            throw new IllegalArgumentException("Student ID and password must be provided");
        }

        String studentId = request.studentId().trim().toLowerCase();
        String rawPassword = request.password().trim();

        User user = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid student ID or password"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid student ID or password");
        }

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new ForbiddenException("Account is disabled");
        }

        String token = jwtProvider.generateToken(user);

        return new LoginResponse(
                token,
                user.getStudentId(),
                user.getName(),
                user.getRole().name()
        );
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
                user.getRole().name()
        );
    }
}

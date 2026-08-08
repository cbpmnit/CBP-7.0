package com.cbp7.auth;

import com.cbp7.auth.dto.LoginRequest;
import com.cbp7.auth.dto.LoginResponse;
import com.cbp7.auth.dto.RegisterRequest;
import com.cbp7.auth.dto.UserResponse;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.auth.security.JwtProvider;
import com.cbp7.auth.service.AuthService;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.InvalidCredentialsException;
import com.cbp7.common.exception.UnauthorizedException;
import com.cbp7.notification.event.NotificationEventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JwtProvider jwtProvider;
    private NotificationEventPublisher notificationEventPublisher;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = new BCryptPasswordEncoder();
        jwtProvider = mock(JwtProvider.class);
        notificationEventPublisher = mock(NotificationEventPublisher.class);
        authService = new AuthService(userRepository, passwordEncoder, jwtProvider, notificationEventPublisher);
    }

    @Test
    void register_Success() {
        RegisterRequest request = new RegisterRequest(
                " 2024UCS1234 ",
                " STUDENT@CBP.COM ",
                " John Doe ",
                " 9876543210 ",
                "secret123",
                "secret123"
        );

        when(userRepository.existsByStudentId("2024ucs1234")).thenReturn(false);
        when(userRepository.existsByEmail("student@cbp.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String result = authService.register(request);

        assertEquals("User registered successfully", result);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals("2024ucs1234", savedUser.getStudentId());
        assertEquals("student@cbp.com", savedUser.getEmail());
        assertEquals("John Doe", savedUser.getName());
        assertEquals("9876543210", savedUser.getPhoneNumber());
        assertEquals(Role.ROLE_STUDENT, savedUser.getRole());
        assertTrue(savedUser.getEnabled());
        assertTrue(passwordEncoder.matches("secret123", savedUser.getPassword()));
    }

    @Test
    void register_PasswordMismatch_ThrowsIllegalArgumentException() {
        RegisterRequest request = new RegisterRequest(
                "2024UCS1234",
                "student@cbp.com",
                "John Doe",
                "9876543210",
                "secret123",
                "differentPassword"
        );

        assertThrows(IllegalArgumentException.class, () -> authService.register(request));
    }

    @Test
    void register_DuplicateStudentId_ThrowsDuplicateResourceException() {
        RegisterRequest request = new RegisterRequest(
                "2024UCS1234",
                "student@cbp.com",
                "John Doe",
                "9876543210",
                "secret123",
                "secret123"
        );

        when(userRepository.existsByStudentId("2024ucs1234")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
    }

    @Test
    void login_CaseInsensitiveStudentId_Success() {
        String rawPassword = "myPassword123";
        String encodedPassword = passwordEncoder.encode(rawPassword);

        User existingUser = User.builder()
                .studentId("2024ucs1234")
                .email("student@cbp.com")
                .name("John Doe")
                .password(encodedPassword)
                .role(Role.ROLE_STUDENT)
                .enabled(true)
                .build();

        when(userRepository.findByStudentId("2024ucs1234")).thenReturn(Optional.of(existingUser));
        when(jwtProvider.generateToken(existingUser)).thenReturn("mock.jwt.token");

        LoginRequest loginRequest = new LoginRequest("2024UCS1234", rawPassword);

        LoginResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.token());
        assertEquals("2024ucs1234", response.studentId());
        assertEquals("John Doe", response.name());
        assertEquals("ROLE_STUDENT", response.role());
    }

    @Test
    void login_InvalidPassword_ThrowsInvalidCredentialsException() {
        String encodedPassword = passwordEncoder.encode("correctPassword");

        User existingUser = User.builder()
                .studentId("2024ucs1234")
                .email("student@cbp.com")
                .name("John Doe")
                .password(encodedPassword)
                .role(Role.ROLE_STUDENT)
                .enabled(true)
                .build();

        when(userRepository.findByStudentId("2024ucs1234")).thenReturn(Optional.of(existingUser));

        LoginRequest loginRequest = new LoginRequest("2024UCS1234", "wrongPassword");

        assertThrows(InvalidCredentialsException.class, () -> authService.login(loginRequest));
    }

    @Test
    void getCurrentUser_NullUser_ThrowsUnauthorizedException() {
        assertThrows(UnauthorizedException.class, () -> authService.getCurrentUser(null));
    }

    @Test
    void getCurrentUser_Success() {
        User user = User.builder()
                .studentId("2024ucs1234")
                .email("student@cbp.com")
                .name("John Doe")
                .phoneNumber("9876543210")
                .role(Role.ROLE_STUDENT)
                .build();

        UserResponse response = authService.getCurrentUser(user);

        assertNotNull(response);
        assertEquals("2024ucs1234", response.studentId());
        assertEquals("student@cbp.com", response.email());
        assertEquals("John Doe", response.name());
        assertEquals("9876543210", response.phoneNumber());
        assertEquals("ROLE_STUDENT", response.role());
    }
}

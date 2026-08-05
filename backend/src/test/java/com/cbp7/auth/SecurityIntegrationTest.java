package com.cbp7.auth;

import com.cbp7.auth.controller.AuthController;
import com.cbp7.auth.dto.LoginRequest;
import com.cbp7.auth.dto.LoginResponse;
import com.cbp7.auth.dto.RegisterRequest;
import com.cbp7.auth.dto.UserResponse;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.service.AuthService;
import com.cbp7.common.exception.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SecurityIntegrationTest {

    private MockMvc mockMvc;
    private AuthService authService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        authService = mock(AuthService.class);
        objectMapper = new ObjectMapper();
        AuthController authController = new AuthController(authService);
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void register_PublicAccess_Success() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "2023UCP1234",
                "2024uch1175@mnit.ac.in",
                "Parv Agrawal",
                "9876543210",
                "Password@123",
                "Password@123"
        );

        when(authService.register(any())).thenReturn("User registered successfully");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User registered successfully"));
    }

    @Test
    void login_PublicAccess_Success() throws Exception {
        LoginRequest request = new LoginRequest("2023UCP1234", "Password@123");
        LoginResponse loginResponse = new LoginResponse("mock.jwt.token", "2023ucp1234", "Parv Agrawal", "ROLE_STUDENT");

        when(authService.login(any())).thenReturn(loginResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("mock.jwt.token"));
    }

    @Test
    void logout_PublicAccess_Success() throws Exception {
        when(authService.logout()).thenReturn("Logged out successfully");

        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }

    @Test
    void me_AuthenticatedUser_ReturnsUserProfile() throws Exception {
        User user = User.builder()
                .studentId("2023ucp1234")
                .email("2024uch1175@mnit.ac.in")
                .name("Parv Agrawal")
                .phoneNumber("9876543210")
                .role(Role.ROLE_STUDENT)
                .build();

        UserResponse userResponse = new UserResponse(
                "2023ucp1234",
                "2024uch1175@mnit.ac.in",
                "Parv Agrawal",
                "9876543210",
                "ROLE_STUDENT"
        );

        when(authService.getCurrentUser(any())).thenReturn(userResponse);

        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.studentId").value("2023ucp1234"));
    }
}

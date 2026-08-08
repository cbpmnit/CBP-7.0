package com.cbp7.auth;

import com.cbp7.auth.dto.LoginRequest;
import com.cbp7.auth.dto.RegisterRequest;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS identity; CREATE SCHEMA IF NOT EXISTS program; CREATE SCHEMA IF NOT EXISTS platform;"
})
class AuthControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        userRepository.deleteAll();
    }

    @Test
    @DisplayName("1. New student registration succeeds, persists to database, and allows login")
    void testRegisterAndLoginFlow() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "2024TEST001",
                "testuser001@mnit.ac.in",
                "Test User One",
                "9876543210",
                "Password@123",
                "Password@123"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        Optional<User> userOpt = userRepository.findByStudentId("2024test001");
        assertTrue(userOpt.isPresent());
        User user = userOpt.get();
        assertEquals("testuser001@mnit.ac.in", user.getEmail());
        assertEquals("Test User One", user.getName());
        assertNotNull(user.getCreatedAt());

        LoginRequest loginRequest = new LoginRequest("2024TEST001", "Password@123");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists());
    }

    @Test
    @DisplayName("2. Registration accepts 'email' JSON property name via JsonAlias")
    void testRegisterWithEmailAliasPayload() throws Exception {
        String jsonPayload = """
                {
                    "studentId": "2024TEST002",
                    "email": "testuser002@mnit.ac.in",
                    "name": "Test User Two",
                    "phoneNumber": "9876543210",
                    "password": "Password@123"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        Optional<User> userOpt = userRepository.findByStudentId("2024test002");
        assertTrue(userOpt.isPresent());
    }

    @Test
    @DisplayName("3. Duplicate student ID registration returns 409 Conflict")
    void testDuplicateStudentIdReturns409() throws Exception {
        RegisterRequest req1 = new RegisterRequest(
                "2024TEST003",
                "testuser003@mnit.ac.in",
                "User Three",
                "9876543210",
                "Password@123",
                "Password@123"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isOk());

        RegisterRequest req2 = new RegisterRequest(
                "2024TEST003",
                "different003@mnit.ac.in",
                "Another User",
                "9876543210",
                "Password@123",
                "Password@123"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("4. Duplicate email registration returns 409 Conflict")
    void testDuplicateEmailReturns409() throws Exception {
        RegisterRequest req1 = new RegisterRequest(
                "2024TEST004",
                "testuser004@mnit.ac.in",
                "User Four",
                "9876543210",
                "Password@123",
                "Password@123"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isOk());

        RegisterRequest req2 = new RegisterRequest(
                "2024TEST005",
                "testuser004@mnit.ac.in",
                "Different User",
                "9876543210",
                "Password@123",
                "Password@123"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }
}

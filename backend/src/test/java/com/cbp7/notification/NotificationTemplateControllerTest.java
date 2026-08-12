package com.cbp7.notification;

import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.auth.security.JwtProvider;
import com.cbp7.notification.dto.request.CreateNotificationTemplateRequest;
import com.cbp7.notification.dto.request.UpdateNotificationTemplateRequest;
import com.cbp7.notification.entity.NotificationChannel;
import com.cbp7.notification.entity.NotificationTemplate;
import com.cbp7.notification.entity.NotificationType;
import com.cbp7.notification.repository.NotificationTemplateRepository;
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

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS identity; CREATE SCHEMA IF NOT EXISTS program; CREATE SCHEMA IF NOT EXISTS platform;"
})
class NotificationTemplateControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationTemplateRepository notificationTemplateRepository;

    @Autowired
    private JwtProvider jwtProvider;

    private String adminToken;
    private String studentToken;
    private String volunteerToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        notificationTemplateRepository.deleteAll();

        User adminUser = userRepository.findByStudentId("2024admin001")
                .orElseGet(() -> userRepository.save(User.builder()
                        .studentId("2024admin001")
                        .email("admin@mnit.ac.in")
                        .name("Admin User")
                        .password("password123")
                        .role(Role.ROLE_ADMIN)
                        .enabled(true)
                        .build()));

        User studentUser = userRepository.findByStudentId("2024student001")
                .orElseGet(() -> userRepository.save(User.builder()
                        .studentId("2024student001")
                        .email("student@mnit.ac.in")
                        .name("Student User")
                        .password("password123")
                        .role(Role.ROLE_STUDENT)
                        .enabled(true)
                        .build()));

        User volunteerUser = userRepository.findByStudentId("2024volunteer001")
                .orElseGet(() -> userRepository.save(User.builder()
                        .studentId("2024volunteer001")
                        .email("volunteer@mnit.ac.in")
                        .name("Volunteer User")
                        .password("password123")
                        .role(Role.ROLE_VOLUNTEER)
                        .enabled(true)
                        .build()));

        adminToken = jwtProvider.generateToken(adminUser);
        studentToken = jwtProvider.generateToken(studentUser);
        volunteerToken = jwtProvider.generateToken(volunteerUser);
    }

    @Test
    @DisplayName("1. Admin creates template successfully -> HTTP 201")
    void adminCreatesTemplateSuccessfully() throws Exception {
        CreateNotificationTemplateRequest request = new CreateNotificationTemplateRequest(
                "Registration Confirmation",
                NotificationChannel.EMAIL,
                NotificationType.REGISTRATION_SUCCESS,
                "CBP Registration Successful",
                "Hello {{studentName}}, your registration id is {{registrationId}}",
                "studentName,registrationId"
        );

        mockMvc.perform(post("/api/v1/admin/notifications/templates")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Registration Confirmation"))
                .andExpect(jsonPath("$.data.channel").value("EMAIL"))
                .andExpect(jsonPath("$.data.type").value("REGISTRATION_SUCCESS"))
                .andExpect(jsonPath("$.data.subject").value("CBP Registration Successful"))
                .andExpect(jsonPath("$.data.content").value("Hello {{studentName}}, your registration id is {{registrationId}}"))
                .andExpect(jsonPath("$.data.variables").value("studentName,registrationId"))
                .andExpect(jsonPath("$.data.createdBy").value("2024admin001"));

        assertFalse(notificationTemplateRepository.findAll().isEmpty());
    }

    @Test
    @DisplayName("2. Admin fetches templates -> HTTP 200")
    void adminFetchesTemplates() throws Exception {
        NotificationTemplate template = NotificationTemplate.builder()
                .name("Welcome Message")
                .channel(NotificationChannel.SYSTEM)
                .type(NotificationType.REGISTRATION_SUCCESS)
                .content("Welcome to CBP!")
                .createdBy("2024admin001")
                .build();
        notificationTemplateRepository.save(template);

        mockMvc.perform(get("/api/v1/admin/notifications/templates")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name").value("Welcome Message"));
    }

    @Test
    @DisplayName("3. Admin updates template -> HTTP 200")
    void adminUpdatesTemplate() throws Exception {
        NotificationTemplate template = NotificationTemplate.builder()
                .name("Old Template")
                .channel(NotificationChannel.EMAIL)
                .type(NotificationType.REGISTRATION_SUCCESS)
                .subject("Old Subject")
                .content("Old Content")
                .createdBy("2024admin001")
                .build();
        NotificationTemplate saved = notificationTemplateRepository.save(template);

        UpdateNotificationTemplateRequest updateRequest = new UpdateNotificationTemplateRequest(
                "Updated Template",
                NotificationChannel.WHATSAPP,
                NotificationType.PAYMENT_SUCCESS,
                "Updated Subject",
                "Updated Content",
                "var1,var2"
        );

        mockMvc.perform(put("/api/v1/admin/notifications/templates/{id}", saved.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Updated Template"))
                .andExpect(jsonPath("$.data.channel").value("WHATSAPP"))
                .andExpect(jsonPath("$.data.type").value("PAYMENT_SUCCESS"))
                .andExpect(jsonPath("$.data.content").value("Updated Content"));
    }

    @Test
    @DisplayName("4. Admin deletes template -> HTTP 204")
    void adminDeletesTemplate() throws Exception {
        NotificationTemplate template = NotificationTemplate.builder()
                .name("ToDelete")
                .channel(NotificationChannel.SYSTEM)
                .content("Delete me")
                .createdBy("2024admin001")
                .build();
        NotificationTemplate saved = notificationTemplateRepository.save(template);

        mockMvc.perform(delete("/api/v1/admin/notifications/templates/{id}", saved.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        assertTrue(notificationTemplateRepository.findById(saved.getId()).isEmpty());
    }

    @Test
    @DisplayName("5. Student tries creating template -> HTTP 403")
    void studentTriesCreatingTemplate() throws Exception {
        CreateNotificationTemplateRequest request = new CreateNotificationTemplateRequest(
                "Student Template",
                NotificationChannel.EMAIL,
                NotificationType.REGISTRATION_SUCCESS,
                "Subject",
                "Content",
                null
        );

        mockMvc.perform(post("/api/v1/admin/notifications/templates")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("6. Volunteer tries creating template -> HTTP 403")
    void volunteerTriesCreatingTemplate() throws Exception {
        CreateNotificationTemplateRequest request = new CreateNotificationTemplateRequest(
                "Volunteer Template",
                NotificationChannel.EMAIL,
                NotificationType.REGISTRATION_SUCCESS,
                "Subject",
                "Content",
                null
        );

        mockMvc.perform(post("/api/v1/admin/notifications/templates")
                        .header("Authorization", "Bearer " + volunteerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("7. Without JWT -> HTTP 401")
    void withoutJwtReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/notifications/templates"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("8. Admin creates template without NotificationType -> HTTP 400")
    void adminCreatesTemplateWithoutTypeReturns400() throws Exception {
        CreateNotificationTemplateRequest request = new CreateNotificationTemplateRequest(
                "Invalid Template",
                NotificationChannel.EMAIL,
                null,
                "Subject",
                "Content",
                null
        );

        mockMvc.perform(post("/api/v1/admin/notifications/templates")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}

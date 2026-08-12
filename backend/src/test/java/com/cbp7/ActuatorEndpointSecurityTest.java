package com.cbp7;

import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.identity.auth.security.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.Set;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "management.endpoints.web.exposure.include=health,info,metrics",
    "management.info.env.enabled=true",
    "info.app.name=CBP 7.0 Backend",
    "info.app.version=0.0.1-SNAPSHOT"
})
@Transactional
class ActuatorEndpointSecurityTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private JwtProvider jwtProvider;

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
    void health_PublicAccess_ReturnsUp() throws Exception {
        mockMvc.perform(get("/actuator/health")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.components").doesNotExist())
                .andExpect(jsonPath("$.details").doesNotExist());
    }

    @Test
    void info_AnonymousAccess_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/actuator/info")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void info_StudentAccess_ReturnsForbidden() throws Exception {
        User student = User.builder()
                .studentId("2023UCP1234")
                .email("student@cbpmnit.in")
                .name("Student User")
                .role(Role.ROLE_STUDENT)
                .enabled(true)
                .build();
        student.addRole(Role.ROLE_STUDENT);
        userRepository.save(student);

        String token = jwtProvider.generateToken(student);

        mockMvc.perform(get("/actuator/info")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void info_AdminAccess_ReturnsOkWithDetails() throws Exception {
        User admin = User.builder()
                .studentId("2023UCP9999")
                .email("admin@cbpmnit.in")
                .name("Admin User")
                .role(Role.ROLE_ADMIN)
                .enabled(true)
                .build();
        admin.addRole(Role.ROLE_ADMIN);
        userRepository.save(admin);

        String token = jwtProvider.generateToken(admin);

        mockMvc.perform(get("/actuator/info")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.app.name", is("CBP 7.0 Backend")))
                .andExpect(jsonPath("$.app.version", is("0.0.1-SNAPSHOT")));
    }

    @Test
    void metrics_AnonymousAccess_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/actuator/metrics")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void metrics_StudentAccess_ReturnsForbidden() throws Exception {
        User student = User.builder()
                .studentId("2023UCP1234")
                .email("student@cbpmnit.in")
                .name("Student User")
                .role(Role.ROLE_STUDENT)
                .enabled(true)
                .build();
        student.addRole(Role.ROLE_STUDENT);
        userRepository.save(student);

        String token = jwtProvider.generateToken(student);

        mockMvc.perform(get("/actuator/metrics")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void metrics_AdminAccess_ReturnsOkWithMetricNames() throws Exception {
        User admin = User.builder()
                .studentId("2023UCP9999")
                .email("admin@cbpmnit.in")
                .name("Admin User")
                .role(Role.ROLE_ADMIN)
                .enabled(true)
                .build();
        admin.addRole(Role.ROLE_ADMIN);
        userRepository.save(admin);

        String token = jwtProvider.generateToken(admin);

        mockMvc.perform(get("/actuator/metrics")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.names").isArray())
                .andExpect(jsonPath("$.names", hasItem("jvm.memory.used")));
    }

    @Test
    void metricDetails_AdminAccess_ReturnsOk() throws Exception {
        User admin = User.builder()
                .studentId("2023UCP9999")
                .email("admin@cbpmnit.in")
                .name("Admin User")
                .role(Role.ROLE_ADMIN)
                .enabled(true)
                .build();
        admin.addRole(Role.ROLE_ADMIN);
        userRepository.save(admin);

        String token = jwtProvider.generateToken(admin);

        mockMvc.perform(get("/actuator/metrics/jvm.memory.used")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("jvm.memory.used")))
                .andExpect(jsonPath("$.measurements").isArray());
    }

    @Test
    void disabledEndpoints_ReturnsUnauthorizedOrForbidden() throws Exception {
        mockMvc.perform(get("/actuator/env")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}

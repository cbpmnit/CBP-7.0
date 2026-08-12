package com.cbp7.platform.admin;

import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.identity.auth.security.JwtProvider;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.program.registration.enums.RegistrationStatus;
import com.cbp7.program.registration.repository.CbpRegistrationRepository;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.identity.profile.entity.Branch;
import com.cbp7.identity.profile.entity.Course;
import com.cbp7.identity.profile.entity.Gender;
import com.cbp7.identity.profile.entity.UserProfile;
import com.cbp7.identity.profile.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS identity; CREATE SCHEMA IF NOT EXISTS program; CREATE SCHEMA IF NOT EXISTS platform; CREATE SCHEMA IF NOT EXISTS finance;"
})
class AdminStudentManagementControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private CbpRegistrationRepository registrationRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private JwtProvider jwtProvider;

    private String adminToken;
    private String studentToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        User adminUser = userRepository.findByStudentId("2024adminmgmt001")
                .orElseGet(() -> userRepository.save(User.builder()
                        .studentId("2024adminmgmt001")
                        .email("adminmgmt@mnit.ac.in")
                        .name("Admin Mgmt")
                        .password("password123")
                        .role(Role.ROLE_ADMIN)
                        .enabled(true)
                        .build()));

        adminToken = jwtProvider.generateToken(adminUser);

        User student = userRepository.findByStudentId("2024test001")
                .orElseGet(() -> userRepository.save(User.builder()
                        .studentId("2024test001")
                        .email("alice@mnit.ac.in")
                        .name("Alice Sharma")
                        .password("password123")
                        .role(Role.ROLE_STUDENT)
                        .enabled(true)
                        .build()));

        studentToken = jwtProvider.generateToken(student);

        UserProfile profile = userProfileRepository.findByUser(student)
                .orElseGet(() -> userProfileRepository.save(UserProfile.builder()
                        .user(student)
                        .firstName("Alice")
                        .lastName("Sharma")
                        .phoneNumber("9876543210")
                        .sameAsWhatsapp(true)
                        .gender(Gender.FEMALE)
                        .dateOfBirth(LocalDate.of(2003, 5, 15))
                        .course(Course.BTECH)
                        .branch(Branch.COMPUTER_SCIENCE_ENGINEERING)
                        .year(3)
                        .hosteller(false)
                        .institute("MNIT Jaipur")
                        .build()));

        registrationRepository.deleteAll();

        CbpRegistration reg = CbpRegistration.builder()
                .registrationId("CBP7009999")
                .user(student)
                .profile(profile)
                .studentId("2024test001")
                .firstName("Alice")
                .lastName("Sharma")
                .email("alice@mnit.ac.in")
                .phoneNumber("9876543210")
                .institute("MNIT Jaipur")
                .branch("Computer Engineering")
                .course("B.Tech")
                .year(3)
                .hosteller(false)
                .registrationStatus(RegistrationStatus.REGISTERED)
                .build();
        CbpRegistration savedReg = registrationRepository.save(reg);

        Payment payment = Payment.builder()
                .userId(student.getId())
                .registrationId(savedReg.getId())
                .paymentMode(com.cbp7.payment.enums.PaymentMode.ONLINE)
                .amount(BigDecimal.valueOf(500))
                .paymentStatus(PaymentStatus.SUCCESS)
                .transactionId("TXN_TEST_12345")
                .build();
        paymentRepository.save(payment);
    }

    @Test
    void testGetStudentsDirectory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/students")
                        .param("search", "Alice")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].studentId").value("2024test001"))
                .andExpect(jsonPath("$.data.content[0].name").value("Alice Sharma"))
                .andExpect(jsonPath("$.data.content[0].email").value("alice@mnit.ac.in"))
                .andExpect(jsonPath("$.data.content[0].paymentStatus").value("SUCCESS"))
                .andExpect(jsonPath("$.data.totalElements").isNumber());
    }

    @Test
    void testGetStudentsPagination() throws Exception {
        mockMvc.perform(get("/api/v1/admin/students")
                        .param("page", "0")
                        .param("size", "10")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.pageable.pageSize").value(10))
                .andExpect(jsonPath("$.data.totalElements").isNumber());
    }

    @Test
    void testUnauthorizedUserCannotAccessStudentsEndpoint() throws Exception {
        // Unauthenticated request
        mockMvc.perform(get("/api/v1/admin/students"))
                .andExpect(status().isUnauthorized());

        // Forbidden request with Student role token
        mockMvc.perform(get("/api/v1/admin/students")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetStudentFullDetail() throws Exception {
        mockMvc.perform(get("/api/v1/admin/students/2024test001")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.student.name").value("Alice Sharma"));
    }

    @Test
    void testUpdateStudentProfile() throws Exception {
        String updateJson = """
            {
              "firstName": "AliceUpdated",
              "lastName": "Sharma",
              "phone": "9998887776",
              "course": "B.Tech",
              "branch": "CSE",
              "year": "4"
            }
            """;

        mockMvc.perform(put("/api/v1/admin/students/2024test001/profile")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.student.name").value("AliceUpdated Sharma"));
    }

    @Test
    void testDownloadStudentPdf() throws Exception {
        mockMvc.perform(get("/api/v1/admin/students/2024test001/profile/pdf")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"));
    }

    @Test
    void testExportStudentsCsv() throws Exception {
        mockMvc.perform(get("/api/v1/admin/students/export")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv;charset=UTF-8"));
    }
}

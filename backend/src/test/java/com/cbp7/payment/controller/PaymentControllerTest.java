package com.cbp7.payment.controller;

import com.cbp7.auth.dto.LoginRequest;
import com.cbp7.auth.dto.RegisterRequest;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.cbp.enums.RegistrationStatus;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.common.response.ApiResponse;
import com.cbp7.payment.dto.CreatePaymentRequest;
import com.cbp7.payment.enums.PaymentMode;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.profile.dto.CreateProfileRequest;
import com.cbp7.profile.entity.Branch;
import com.cbp7.profile.entity.Course;
import com.cbp7.profile.entity.Gender;
import com.cbp7.profile.repository.UserProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
public class PaymentControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private CbpRegistrationRepository cbpRegistrationRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    // Helper methods
    private String registerStudent(String studentId, String email, String name, String password) throws Exception {
        RegisterRequest registerRequest = new RegisterRequest(
                studentId, email, name, "9876543210", password, password
        );
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        return getJwtToken(studentId, password);
    }

    private String getJwtToken(String studentId, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest(studentId, password);
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseStr = result.getResponse().getContentAsString();
        JsonNode root = objectMapper.readTree(responseStr);
        return root.path("data").path("token").asText();
    }

    private void createProfile(String token) throws Exception {
        CreateProfileRequest request = new CreateProfileRequest(
                "Parv", null, "Agrawal", null, Gender.MALE, LocalDate.of(2002, 5, 15),
                "9876543210", true, null, "MNIT Jaipur", Course.BTECH,
                Branch.COMPUTER_SCIENCE_ENGINEERING, 3, "A", true, "H-101", "Jaipur", "Rajasthan"
        );
        mockMvc.perform(post("/api/v1/profile")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    private void createCbpRegistration(String token) throws Exception {
        mockMvc.perform(post("/api/v1/cbp/register")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated());
    }

    private void printResponse(String label, MvcResult result) throws Exception {
        System.out.println("=== " + label + " ===");
        System.out.println("Status : " + result.getResponse().getStatus());
        String responseBody = result.getResponse().getContentAsString();
        if (StringUtils.hasText(responseBody)) {
            Object json = objectMapper.readValue(responseBody, Object.class);
            System.out.println(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(json));
        }
        System.out.println();
    }

    // 1. shouldCreateOnlinePaymentSuccessfully
    @Test
    void shouldCreateOnlinePaymentSuccessfully() throws Exception {
        String token = registerStudent("2023UCP2001", "student2001@mnit.ac.in", "Parv Agrawal", "Password@123");
        createProfile(token);
        createCbpRegistration(token);

        CreatePaymentRequest paymentRequest = new CreatePaymentRequest(PaymentMode.ONLINE);

        MvcResult result = mockMvc.perform(post("/api/v1/payment/create")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(paymentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", equalTo(true)))
                .andExpect(jsonPath("$.message", equalTo("Payment initiated successfully")))
                .andExpect(jsonPath("$.data.paymentId", notNullValue()))
                .andExpect(jsonPath("$.data.paymentMode", equalTo(PaymentMode.ONLINE.name())))
                .andExpect(jsonPath("$.data.paymentStatus", equalTo(PaymentStatus.PENDING.name())))
                .andExpect(jsonPath("$.data.amount", equalTo(100)))
                .andReturn();

        printResponse("CREATE ONLINE PAYMENT RESPONSE", result);
    }

    // 2. shouldCreateCashPaymentSuccessfully
    @Test
    void shouldCreateCashPaymentSuccessfully() throws Exception {
        String token = registerStudent("2023UCP2002", "student2002@mnit.ac.in", "Parv Agrawal", "Password@123");
        createProfile(token);
        createCbpRegistration(token);

        CreatePaymentRequest paymentRequest = new CreatePaymentRequest(PaymentMode.CASH);

        MvcResult result = mockMvc.perform(post("/api/v1/payment/create")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(paymentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", equalTo(true)))
                .andExpect(jsonPath("$.data.paymentMode", equalTo(PaymentMode.CASH.name())))
                .andExpect(jsonPath("$.data.paymentStatus", equalTo(PaymentStatus.PENDING.name())))
                .andReturn();

        printResponse("CREATE CASH PAYMENT RESPONSE", result);
    }

    // 3. shouldRejectPaymentWithoutCbpRegistration
    @Test
    void shouldRejectPaymentWithoutCbpRegistration() throws Exception {
        String token = registerStudent("2023UCP2003", "student2003@mnit.ac.in", "Parv Agrawal", "Password@123");
        createProfile(token);

        CreatePaymentRequest paymentRequest = new CreatePaymentRequest(PaymentMode.ONLINE);

        MvcResult result = mockMvc.perform(post("/api/v1/payment/create")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(paymentRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", equalTo(false)))
                .andExpect(jsonPath("$.status", equalTo(400)))
                .andExpect(jsonPath("$.message", equalTo("Please complete CBP registration first.")))
                .andReturn();

        printResponse("REJECT PAYMENT WITHOUT REGISTRATION RESPONSE", result);
    }

    // 4. shouldRejectDuplicatePayment
    @Test
    void shouldRejectDuplicatePayment() throws Exception {
        String token = registerStudent("2023UCP2004", "student2004@mnit.ac.in", "Parv Agrawal", "Password@123");
        createProfile(token);
        createCbpRegistration(token);

        CreatePaymentRequest paymentRequest = new CreatePaymentRequest(PaymentMode.ONLINE);

        // Initiate first payment
        MvcResult firstResult = mockMvc.perform(post("/api/v1/payment/create")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(paymentRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        // Simulate that the payment is successful
        String responseStr = firstResult.getResponse().getContentAsString();
        JsonNode root = objectMapper.readTree(responseStr);
        String paymentIdStr = root.path("data").path("paymentId").asText();
        UUID paymentId = UUID.fromString(paymentIdStr);
        paymentRepository.findById(paymentId).ifPresent(p -> {
            p.setPaymentStatus(PaymentStatus.SUCCESS);
            paymentRepository.saveAndFlush(p);
        });

        // Try initiating again (should be rejected since SUCCESS payment exists)
        MvcResult result = mockMvc.perform(post("/api/v1/payment/create")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(paymentRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", equalTo(false)))
                .andExpect(jsonPath("$.status", equalTo(409)))
                .andExpect(jsonPath("$.message", equalTo("Payment already completed.")))
                .andReturn();

        printResponse("REJECT DUPLICATE PAYMENT RESPONSE", result);
    }

    // 5. shouldRejectUnauthorizedRequest
    @Test
    void shouldRejectUnauthorizedRequest() throws Exception {
        CreatePaymentRequest paymentRequest = new CreatePaymentRequest(PaymentMode.ONLINE);

        MvcResult result = mockMvc.perform(post("/api/v1/payment/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(paymentRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", equalTo(401)))
                .andReturn();

        printResponse("REJECT UNAUTHORIZED PAYMENT RESPONSE", result);
    }

    // 6. shouldRejectVolunteerPaymentCreation
    @Test
    void shouldRejectVolunteerPaymentCreation() throws Exception {
        String token = registerStudent("2023UCP2006", "volunteer2006@mnit.ac.in", "Volunteer User", "Password@123");
        User user = userRepository.findByStudentId("2023ucp2006").orElseThrow();
        user.setRole(Role.ROLE_VOLUNTEER);
        userRepository.saveAndFlush(user);

        CreatePaymentRequest paymentRequest = new CreatePaymentRequest(PaymentMode.ONLINE);

        MvcResult result = mockMvc.perform(post("/api/v1/payment/create")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(paymentRequest)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", equalTo(403)))
                .andReturn();

        printResponse("REJECT VOLUNTEER PAYMENT RESPONSE", result);
    }

    // 7. shouldFetchCurrentPaymentSuccessfully
    @Test
    void shouldFetchCurrentPaymentSuccessfully() throws Exception {
        String token = registerStudent("2023UCP2007", "student2007@mnit.ac.in", "Parv Agrawal", "Password@123");
        createProfile(token);
        createCbpRegistration(token);

        CreatePaymentRequest paymentRequest = new CreatePaymentRequest(PaymentMode.ONLINE);

        // Initiate payment
        mockMvc.perform(post("/api/v1/payment/create")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(paymentRequest)))
                .andExpect(status().isCreated());

        // Fetch payment
        MvcResult result = mockMvc.perform(get("/api/v1/payment/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", equalTo(true)))
                .andExpect(jsonPath("$.data.paymentId", notNullValue()))
                .andExpect(jsonPath("$.data.paymentMode", equalTo(PaymentMode.ONLINE.name())))
                .andExpect(jsonPath("$.data.paymentStatus", equalTo(PaymentStatus.PENDING.name())))
                .andExpect(jsonPath("$.data.amount", equalTo(100)))
                .andExpect(jsonPath("$.data.createdAt", notNullValue()))
                .andReturn();

        printResponse("FETCH CURRENT PAYMENT RESPONSE", result);
    }

    // 8. shouldReturn404WhenPaymentDoesNotExist
    @Test
    void shouldReturn404WhenPaymentDoesNotExist() throws Exception {
        String token = registerStudent("2023UCP2008", "student2008@mnit.ac.in", "Parv Agrawal", "Password@123");

        MvcResult result = mockMvc.perform(get("/api/v1/payment/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", equalTo(false)))
                .andExpect(jsonPath("$.status", equalTo(404)))
                .andExpect(jsonPath("$.message", equalTo("No payment record found for current user.")))
                .andReturn();

        printResponse("PAYMENT NOT FOUND RESPONSE", result);
    }
}

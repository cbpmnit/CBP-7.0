package com.cbp7.payment.controller;

import com.cbp7.identity.auth.dto.request.LoginRequest;
import com.cbp7.identity.auth.dto.request.RegisterRequest;
import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.program.registration.repository.CbpRegistrationRepository;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.entity.PaymentMode;
import com.cbp7.payment.entity.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.identity.profile.dto.request.CreateProfileRequest;
import com.cbp7.identity.profile.entity.Branch;
import com.cbp7.identity.profile.entity.Course;
import com.cbp7.identity.profile.entity.Gender;
import com.cbp7.payment.config.PhonePeConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phonepe.sdk.pg.payments.v2.StandardCheckoutClient;
import com.phonepe.sdk.pg.payments.v2.models.request.StandardCheckoutPayRequest;
import com.phonepe.sdk.pg.payments.v2.models.response.StandardCheckoutPayResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
public class PhonePePaymentInitiationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CbpRegistrationRepository cbpRegistrationRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PhonePeConfig phonePeConfig;

    @MockitoBean
    private StandardCheckoutClient standardCheckoutClient;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

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

    @Test
    void shouldInitiatePhonePePaymentSuccessfully() throws Exception {
        String token = registerStudent("2023UCP3001", "student3001@mnit.ac.in", "Parv Agrawal", "Password@123");
        createProfile(token);
        createCbpRegistration(token);

        StandardCheckoutPayResponse mockResponse = mock(StandardCheckoutPayResponse.class);
        when(mockResponse.getRedirectUrl()).thenReturn("https://phonepe-payment-url");
        when(standardCheckoutClient.pay(any(StandardCheckoutPayRequest.class))).thenReturn(mockResponse);

        MvcResult result = mockMvc.perform(post("/api/v1/payment/phonepe/initiate")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", equalTo(true)))
                .andExpect(jsonPath("$.message", equalTo("Payment initiated successfully")))
                .andExpect(jsonPath("$.data.paymentId", notNullValue()))
                .andExpect(jsonPath("$.data.transactionId", notNullValue()))
                .andExpect(jsonPath("$.data.redirectUrl", equalTo("https://phonepe-payment-url")))
                .andExpect(jsonPath("$.data.paymentStatus", equalTo(PaymentStatus.INITIATED.name())))
                .andReturn();

        printResponse("INITIATE PHONEPE PAYMENT RESPONSE", result);
    }

    @Test
    void shouldRejectPaymentWithoutCbpRegistration() throws Exception {
        String token = registerStudent("2023UCP3002", "student3002@mnit.ac.in", "Parv Agrawal", "Password@123");
        createProfile(token);

        MvcResult result = mockMvc.perform(post("/api/v1/payment/phonepe/initiate")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", equalTo(false)))
                .andExpect(jsonPath("$.status", equalTo(400)))
                .andExpect(jsonPath("$.message", equalTo("Please complete CBP registration first.")))
                .andReturn();

        printResponse("REJECT PAYMENT WITHOUT CBP REGISTRATION RESPONSE", result);
    }

    @Test
    void shouldRejectAlreadyCompletedPayment() throws Exception {
        String token = registerStudent("2023UCP3003", "student3003@mnit.ac.in", "Parv Agrawal", "Password@123");
        createProfile(token);
        createCbpRegistration(token);

        User user = userRepository.findByStudentId("2023ucp3003").orElseThrow();
        var registration = cbpRegistrationRepository.findByUserStudentIdIgnoreCase("2023ucp3003").orElseThrow();

        Payment payment = Payment.builder()
                .registrationId(registration.getId())
                .userId(user.getId())
                .paymentMode(PaymentMode.ONLINE)
                .paymentStatus(PaymentStatus.SUCCESS)
                .amount(new BigDecimal("100.00"))
                .transactionId("CBP_TXN_PREV")
                .build();
        paymentRepository.saveAndFlush(payment);

        MvcResult result = mockMvc.perform(post("/api/v1/payment/phonepe/initiate")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", equalTo(false)))
                .andExpect(jsonPath("$.status", equalTo(409)))
                .andExpect(jsonPath("$.message", equalTo("Payment already completed.")))
                .andReturn();

        printResponse("REJECT ALREADY COMPLETED PAYMENT RESPONSE", result);
    }

    @Test
    void shouldRejectUnauthorizedUser() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/payment/phonepe/initiate"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", equalTo(401)))
                .andReturn();

        printResponse("REJECT UNAUTHORIZED USER RESPONSE", result);
    }

    @Test
    void shouldRejectVolunteerInitiatingPayment() throws Exception {
        String token = registerStudent("2023UCP3005", "volunteer3005@mnit.ac.in", "Volunteer User", "Password@123");
        User user = userRepository.findByStudentId("2023ucp3005").orElseThrow();
        user.setRole(Role.ROLE_VOLUNTEER);
        userRepository.saveAndFlush(user);

        MvcResult result = mockMvc.perform(post("/api/v1/payment/phonepe/initiate")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", equalTo(403)))
                .andReturn();

        printResponse("REJECT VOLUNTEER PAYMENT RESPONSE", result);
    }

    @Test
    void shouldHandlePhonePeFailure() throws Exception {
        String token = registerStudent("2023UCP3006", "student3006@mnit.ac.in", "Parv Agrawal", "Password@123");
        createProfile(token);
        createCbpRegistration(token);

        com.phonepe.sdk.pg.common.exception.PhonePeException mockException = mock(com.phonepe.sdk.pg.common.exception.PhonePeException.class);
        when(mockException.getHttpStatusCode()).thenReturn(502);
        when(mockException.getCode()).thenReturn("BAD_GATEWAY");
        when(mockException.getMessage()).thenReturn("Bad Gateway");

        when(standardCheckoutClient.pay(any(StandardCheckoutPayRequest.class))).thenThrow(mockException);

        MvcResult result = mockMvc.perform(post("/api/v1/payment/phonepe/initiate")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.success", equalTo(false)))
                .andExpect(jsonPath("$.status", equalTo(502)))
                .andExpect(jsonPath("$.message", equalTo("Unable to initiate payment")))
                .andReturn();

        printResponse("PHONEPE FAILURE HANDLING RESPONSE", result);
    }
}

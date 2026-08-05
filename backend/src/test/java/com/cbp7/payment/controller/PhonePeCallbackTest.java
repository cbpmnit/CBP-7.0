package com.cbp7.payment.controller;

import com.cbp7.auth.dto.LoginRequest;
import com.cbp7.auth.dto.RegisterRequest;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.enums.RegistrationStatus;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.payment.config.PhonePeConfig;
import com.cbp7.payment.dto.PhonePeCallbackRequest;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentMode;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.gateway.PhonePeChecksumUtil;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.profile.dto.CreateProfileRequest;
import com.cbp7.profile.entity.Branch;
import com.cbp7.profile.entity.Course;
import com.cbp7.profile.entity.Gender;
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
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
public class PhonePeCallbackTest {

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

    private User testUser;
    private CbpRegistration testRegistration;
    private Payment testPayment;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        // Register student, profile, and registration
        String token = registerStudent("2026ucp9999", "student9999@mnit.ac.in", "Webhook Test Student", "Password@123");
        createProfile(token);
        createCbpRegistration(token);

        testUser = userRepository.findByStudentId("2026ucp9999").orElseThrow();
        testRegistration = cbpRegistrationRepository.findByUserStudentIdIgnoreCase("2026ucp9999").orElseThrow();

        // Create test payment
        testPayment = Payment.builder()
                .registrationId(testRegistration.getId())
                .userId(testUser.getId())
                .paymentMode(PaymentMode.ONLINE)
                .paymentStatus(PaymentStatus.PENDING)
                .amount(new BigDecimal("500.00"))
                .transactionId("CBP_TXN_TEST123456789")
                .build();
        testPayment = paymentRepository.save(testPayment);
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

    private String createBase64Response(String transactionId, String code, boolean success) throws Exception {
        Map<String, Object> data = new HashMap<>();
        data.put("merchantTransactionId", transactionId);
        
        Map<String, Object> payload = new HashMap<>();
        payload.put("success", success);
        payload.put("code", code);
        payload.put("data", data);

        String json = objectMapper.writeValueAsString(payload);
        return Base64.getEncoder().encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void processCallback_SuccessfulPayment_UpdatesPaymentAndRegistration() throws Exception {
        String base64Response = createBase64Response(testPayment.getTransactionId(), "PAYMENT_SUCCESS", true);
        String xVerify = PhonePeChecksumUtil.generateCallbackChecksum(
                base64Response, phonePeConfig.getClientSecret(), phonePeConfig.getClientVersion()
        );

        PhonePeCallbackRequest callbackRequest = new PhonePeCallbackRequest(base64Response);

        mockMvc.perform(post("/api/v1/payment/phonepe/callback")
                .header("X-VERIFY", xVerify)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(callbackRequest)))
                .andExpect(status().isOk());

        // Refresh and check assertions
        Payment updatedPayment = paymentRepository.findById(testPayment.getId()).orElseThrow();
        assertEquals(PaymentStatus.SUCCESS, updatedPayment.getPaymentStatus());

        CbpRegistration updatedRegistration = cbpRegistrationRepository.findById(testRegistration.getId()).orElseThrow();
        assertEquals(RegistrationStatus.REGISTERED, updatedRegistration.getRegistrationStatus());
    }

    @Test
    void processCallback_FailedPayment_UpdatesPaymentStatusToFailed() throws Exception {
        String base64Response = createBase64Response(testPayment.getTransactionId(), "PAYMENT_ERROR", false);
        String xVerify = PhonePeChecksumUtil.generateCallbackChecksum(
                base64Response, phonePeConfig.getClientSecret(), phonePeConfig.getClientVersion()
        );

        PhonePeCallbackRequest callbackRequest = new PhonePeCallbackRequest(base64Response);

        mockMvc.perform(post("/api/v1/payment/phonepe/callback")
                .header("X-VERIFY", xVerify)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(callbackRequest)))
                .andExpect(status().isOk());

        // Check assertions
        Payment updatedPayment = paymentRepository.findById(testPayment.getId()).orElseThrow();
        assertEquals(PaymentStatus.FAILED, updatedPayment.getPaymentStatus());

        CbpRegistration updatedRegistration = cbpRegistrationRepository.findById(testRegistration.getId()).orElseThrow();
        assertEquals(RegistrationStatus.PAYMENT_PENDING, updatedRegistration.getRegistrationStatus());
    }

    @Test
    void processCallback_InvalidSignature_ReturnsBadRequest() throws Exception {
        String base64Response = createBase64Response(testPayment.getTransactionId(), "PAYMENT_SUCCESS", true);
        String xVerify = "wrong_signature###1";

        PhonePeCallbackRequest callbackRequest = new PhonePeCallbackRequest(base64Response);

        mockMvc.perform(post("/api/v1/payment/phonepe/callback")
                .header("X-VERIFY", xVerify)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(callbackRequest)))
                .andExpect(status().isBadRequest());

        // Check that states are unchanged
        Payment unchangedPayment = paymentRepository.findById(testPayment.getId()).orElseThrow();
        assertEquals(PaymentStatus.PENDING, unchangedPayment.getPaymentStatus());

        CbpRegistration unchangedRegistration = cbpRegistrationRepository.findById(testRegistration.getId()).orElseThrow();
        assertEquals(RegistrationStatus.PAYMENT_PENDING, unchangedRegistration.getRegistrationStatus());
    }

    @Test
    void processCallback_IdempotentDuplicateCall_DoesNotThrowError() throws Exception {
        // First successful call
        String base64Response = createBase64Response(testPayment.getTransactionId(), "PAYMENT_SUCCESS", true);
        String xVerify = PhonePeChecksumUtil.generateCallbackChecksum(
                base64Response, phonePeConfig.getClientSecret(), phonePeConfig.getClientVersion()
        );

        PhonePeCallbackRequest callbackRequest = new PhonePeCallbackRequest(base64Response);

        mockMvc.perform(post("/api/v1/payment/phonepe/callback")
                .header("X-VERIFY", xVerify)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(callbackRequest)))
                .andExpect(status().isOk());

        // Check that it's success
        assertEquals(PaymentStatus.SUCCESS, paymentRepository.findById(testPayment.getId()).orElseThrow().getPaymentStatus());

        // Send callback again
        mockMvc.perform(post("/api/v1/payment/phonepe/callback")
                .header("X-VERIFY", xVerify)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(callbackRequest)))
                .andExpect(status().isOk());

        // Verify still SUCCESS and no errors
        assertEquals(PaymentStatus.SUCCESS, paymentRepository.findById(testPayment.getId()).orElseThrow().getPaymentStatus());
    }

    @Test
    void processCallback_PaymentNotFound_ReturnsNotFound() throws Exception {
        String base64Response = createBase64Response("CBP_TXN_NONEXISTENT", "PAYMENT_SUCCESS", true);
        String xVerify = PhonePeChecksumUtil.generateCallbackChecksum(
                base64Response, phonePeConfig.getClientSecret(), phonePeConfig.getClientVersion()
        );

        PhonePeCallbackRequest callbackRequest = new PhonePeCallbackRequest(base64Response);

        mockMvc.perform(post("/api/v1/payment/phonepe/callback")
                .header("X-VERIFY", xVerify)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(callbackRequest)))
                .andExpect(status().isNotFound());
    }
}

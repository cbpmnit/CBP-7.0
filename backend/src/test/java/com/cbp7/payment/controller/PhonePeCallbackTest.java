package com.cbp7.payment.controller;

import com.cbp7.identity.auth.dto.request.LoginRequest;
import com.cbp7.identity.auth.dto.request.RegisterRequest;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.program.registration.entity.RegistrationStatus;
import com.cbp7.program.registration.repository.CbpRegistrationRepository;
import com.cbp7.payment.config.PhonePeConfig;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.entity.PaymentMode;
import com.cbp7.payment.entity.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.identity.profile.dto.request.CreateProfileRequest;
import com.cbp7.identity.profile.entity.Branch;
import com.cbp7.identity.profile.entity.Course;
import com.cbp7.identity.profile.entity.Gender;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phonepe.sdk.pg.payments.v2.StandardCheckoutClient;
import com.phonepe.sdk.pg.common.models.response.CallbackResponse;
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
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
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

    @MockitoBean
    private StandardCheckoutClient standardCheckoutClient;

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
                .amount(new BigDecimal("100.00"))
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

    @Test
    void processCallback_SuccessfulPayment_UpdatesPaymentAndRegistration() throws Exception {
        CallbackResponse mockResponse = mock(CallbackResponse.class, RETURNS_DEEP_STUBS);
        when(mockResponse.getPayload().getOrderId()).thenReturn(testPayment.getTransactionId());
        when(mockResponse.getPayload().getState()).thenReturn("COMPLETED");

        when(standardCheckoutClient.validateCallback(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/payment/phonepe/callback")
                .header("Authorization", "Basic Y2JwX3VzZXI6Y2JwX3Bhc3M=")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"dummy\":\"payload\"}"))
                .andExpect(status().isOk());

        Payment updatedPayment = paymentRepository.findById(testPayment.getId()).orElseThrow();
        assertEquals(PaymentStatus.SUCCESS, updatedPayment.getPaymentStatus());

        CbpRegistration updatedRegistration = cbpRegistrationRepository.findById(testRegistration.getId()).orElseThrow();
        assertEquals(RegistrationStatus.REGISTERED, updatedRegistration.getRegistrationStatus());
    }

    @Test
    void processCallback_FailedPayment_UpdatesPaymentStatusToFailed() throws Exception {
        CallbackResponse mockResponse = mock(CallbackResponse.class, RETURNS_DEEP_STUBS);
        when(mockResponse.getPayload().getOrderId()).thenReturn(testPayment.getTransactionId());
        when(mockResponse.getPayload().getState()).thenReturn("FAILED");

        when(standardCheckoutClient.validateCallback(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/payment/phonepe/callback")
                .header("Authorization", "Basic Y2JwX3VzZXI6Y2JwX3Bhc3M=")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"dummy\":\"payload\"}"))
                .andExpect(status().isOk());

        Payment updatedPayment = paymentRepository.findById(testPayment.getId()).orElseThrow();
        assertEquals(PaymentStatus.FAILED, updatedPayment.getPaymentStatus());

        CbpRegistration updatedRegistration = cbpRegistrationRepository.findById(testRegistration.getId()).orElseThrow();
        assertEquals(RegistrationStatus.PAYMENT_PENDING, updatedRegistration.getRegistrationStatus());
    }

    @Test
    void processCallback_InvalidSignature_ReturnsBadRequest() throws Exception {
        com.phonepe.sdk.pg.common.exception.PhonePeException mockException = mock(com.phonepe.sdk.pg.common.exception.PhonePeException.class);
        when(mockException.getMessage()).thenReturn("Invalid signature");

        when(standardCheckoutClient.validateCallback(anyString(), anyString(), anyString(), anyString()))
                .thenThrow(mockException);

        mockMvc.perform(post("/api/v1/payment/phonepe/callback")
                .header("Authorization", "wrong_auth_header")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"dummy\":\"payload\"}"))
                .andExpect(status().isBadRequest());

        Payment unchangedPayment = paymentRepository.findById(testPayment.getId()).orElseThrow();
        assertEquals(PaymentStatus.PENDING, unchangedPayment.getPaymentStatus());
    }

    @Test
    void processCallback_IdempotentDuplicateCall_DoesNotThrowError() throws Exception {
        CallbackResponse mockResponse = mock(CallbackResponse.class, RETURNS_DEEP_STUBS);
        when(mockResponse.getPayload().getOrderId()).thenReturn(testPayment.getTransactionId());
        when(mockResponse.getPayload().getState()).thenReturn("COMPLETED");

        when(standardCheckoutClient.validateCallback(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(mockResponse);

        // First call
        mockMvc.perform(post("/api/v1/payment/phonepe/callback")
                .header("Authorization", "Basic Y2JwX3VzZXI6Y2JwX3Bhc3M=")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"dummy\":\"payload\"}"))
                .andExpect(status().isOk());

        assertEquals(PaymentStatus.SUCCESS, paymentRepository.findById(testPayment.getId()).orElseThrow().getPaymentStatus());

        // Second call
        mockMvc.perform(post("/api/v1/payment/phonepe/callback")
                .header("Authorization", "Basic Y2JwX3VzZXI6Y2JwX3Bhc3M=")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"dummy\":\"payload\"}"))
                .andExpect(status().isOk());

        assertEquals(PaymentStatus.SUCCESS, paymentRepository.findById(testPayment.getId()).orElseThrow().getPaymentStatus());
    }

    @Test
    void processCallback_PaymentNotFound_ReturnsNotFound() throws Exception {
        CallbackResponse mockResponse = mock(CallbackResponse.class, RETURNS_DEEP_STUBS);
        when(mockResponse.getPayload().getOrderId()).thenReturn("CBP_TXN_NONEXISTENT");
        when(mockResponse.getPayload().getState()).thenReturn("COMPLETED");

        when(standardCheckoutClient.validateCallback(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/payment/phonepe/callback")
                .header("Authorization", "Basic Y2JwX3VzZXI6Y2JwX3Bhc3M=")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"dummy\":\"payload\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void processCallback_MissingAuthorizationHeader_ReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/v1/payment/phonepe/callback")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"dummy\":\"payload\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void processCallback_MissingBody_ReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/v1/payment/phonepe/callback")
                .header("Authorization", "Basic Y2JwX3VzZXI6Y2JwX3Bhc3M=")
                .contentType(MediaType.APPLICATION_JSON)
                .content(""))
                .andExpect(status().isBadRequest());
    }
}

package com.cbp7.payment.service;

import com.cbp7.identity.auth.dto.request.LoginRequest;
import com.cbp7.identity.auth.dto.request.RegisterRequest;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.program.registration.enums.RegistrationStatus;
import com.cbp7.program.registration.repository.CbpRegistrationRepository;
import com.cbp7.payment.config.PhonePeConfig;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentMode;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.identity.profile.dto.request.CreateProfileRequest;
import com.cbp7.identity.profile.entity.Branch;
import com.cbp7.identity.profile.entity.Course;
import com.cbp7.identity.profile.entity.Gender;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phonepe.sdk.pg.payments.v2.StandardCheckoutClient;
import com.phonepe.sdk.pg.common.models.response.OrderStatusResponse;
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

import static org.hamcrest.Matchers.equalTo;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
public class PaymentVerificationTest {

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
    private String userToken;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        // Register student, profile, and registration
        userToken = registerStudent("2026ucp8888", "student8888@mnit.ac.in", "Verification Test Student", "Password@123");
        createProfile(userToken);
        createCbpRegistration(userToken);

        testUser = userRepository.findByStudentId("2026ucp8888").orElseThrow();
        testRegistration = cbpRegistrationRepository.findByUserStudentIdIgnoreCase("2026ucp8888").orElseThrow();

        // Create test payment in PENDING status
        testPayment = Payment.builder()
                .registrationId(testRegistration.getId())
                .userId(testUser.getId())
                .paymentMode(PaymentMode.ONLINE)
                .paymentStatus(PaymentStatus.PENDING)
                .amount(new BigDecimal("100.00"))
                .transactionId("CBP_TXN_VERIFY_123")
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
    void verifyPayment_PhonePeReturnsSuccess_UpdatesStatusToSuccess() throws Exception {
        OrderStatusResponse mockResponse = mock(OrderStatusResponse.class);
        when(mockResponse.getState()).thenReturn("COMPLETED");
        when(mockResponse.getErrorCode()).thenReturn("PAYMENT_SUCCESS");
        when(standardCheckoutClient.getOrderStatus(testPayment.getTransactionId())).thenReturn(mockResponse);

        mockMvc.perform(get("/api/v1/payment/" + testPayment.getTransactionId() + "/status")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", equalTo(true)))
                .andExpect(jsonPath("$.data.paymentStatus", equalTo(PaymentStatus.SUCCESS.name())))
                .andExpect(jsonPath("$.data.transactionId", equalTo(testPayment.getTransactionId())));

        assertEquals(PaymentStatus.SUCCESS, paymentRepository.findById(testPayment.getId()).orElseThrow().getPaymentStatus());
        assertEquals(RegistrationStatus.REGISTERED, cbpRegistrationRepository.findById(testRegistration.getId()).orElseThrow().getRegistrationStatus());
    }

    @Test
    void verifyPayment_PhonePeReturnsFailed_UpdatesStatusToFailed() throws Exception {
        OrderStatusResponse mockResponse = mock(OrderStatusResponse.class);
        when(mockResponse.getState()).thenReturn("FAILED");
        when(mockResponse.getErrorCode()).thenReturn("PAYMENT_ERROR");
        when(standardCheckoutClient.getOrderStatus(testPayment.getTransactionId())).thenReturn(mockResponse);

        mockMvc.perform(get("/api/v1/payment/" + testPayment.getTransactionId() + "/status")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.paymentStatus", equalTo(PaymentStatus.FAILED.name())));

        assertEquals(PaymentStatus.FAILED, paymentRepository.findById(testPayment.getId()).orElseThrow().getPaymentStatus());
        assertEquals(RegistrationStatus.PAYMENT_PENDING, cbpRegistrationRepository.findById(testRegistration.getId()).orElseThrow().getRegistrationStatus());
    }

    @Test
    void verifyPayment_PhonePeReturnsPending_KeepsStatusPending() throws Exception {
        OrderStatusResponse mockResponse = mock(OrderStatusResponse.class);
        when(mockResponse.getState()).thenReturn("PENDING");
        when(standardCheckoutClient.getOrderStatus(testPayment.getTransactionId())).thenReturn(mockResponse);

        mockMvc.perform(get("/api/v1/payment/" + testPayment.getTransactionId() + "/status")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.paymentStatus", equalTo(PaymentStatus.PENDING.name())));

        assertEquals(PaymentStatus.PENDING, paymentRepository.findById(testPayment.getId()).orElseThrow().getPaymentStatus());
    }

    @Test
    void verifyPayment_AlreadySuccess_DoesNotQueryPhonePe() throws Exception {
        testPayment.setPaymentStatus(PaymentStatus.SUCCESS);
        paymentRepository.saveAndFlush(testPayment);

        mockMvc.perform(get("/api/v1/payment/" + testPayment.getTransactionId() + "/status")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.paymentStatus", equalTo(PaymentStatus.SUCCESS.name())));

        verifyNoInteractions(standardCheckoutClient);
    }

    @Test
    void verifyPayment_MismatchedUserAccess_ReturnsForbidden() throws Exception {
        String token2 = registerStudent("2026ucp7777", "student7777@mnit.ac.in", "User 2", "Password@123");
        createProfile(token2);
        createCbpRegistration(token2);

        mockMvc.perform(get("/api/v1/payment/" + testPayment.getTransactionId() + "/status")
                .header("Authorization", "Bearer " + token2))
                .andExpect(status().isForbidden());
    }

    @Test
    void verifyPayment_PhonePeUnavailable_ReturnsBadGateway() throws Exception {
        com.phonepe.sdk.pg.common.exception.PhonePeException mockException = mock(com.phonepe.sdk.pg.common.exception.PhonePeException.class);
        when(mockException.getHttpStatusCode()).thenReturn(502);
        when(mockException.getCode()).thenReturn("BAD_GATEWAY");
        when(mockException.getMessage()).thenReturn("Bad Gateway");

        when(standardCheckoutClient.getOrderStatus(testPayment.getTransactionId())).thenThrow(mockException);

        mockMvc.perform(get("/api/v1/payment/" + testPayment.getTransactionId() + "/status")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isBadGateway());
    }
}

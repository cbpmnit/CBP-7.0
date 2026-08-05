package com.cbp7.payment.gateway;

import com.cbp7.payment.config.PhonePeConfig;
import com.cbp7.payment.entity.Payment;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@SpringBootTest
@Transactional
class PhonePeGatewayTest {

    @Autowired
    private PaymentGateway paymentGateway;

    @Autowired
    private PhonePeGateway phonePeGateway;

    @Autowired
    private PhonePeConfig phonePeConfig;

    @Autowired
    private RestClient.Builder phonepeRestClientBuilder;

    @Autowired
    private ObjectMapper objectMapper;

    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        mockServer = MockRestServiceServer.bindTo(phonepeRestClientBuilder).build();
        phonePeGateway.setPhonepeRestClient(phonepeRestClientBuilder.build());
    }

    @Test
    void gatewayBeanShouldExist() {
        assertNotNull(paymentGateway);
        assertTrue(paymentGateway instanceof PhonePeGateway);
    }

    @Test
    void shouldGeneratePayloadWithConfiguredUrls() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID regId = UUID.randomUUID();
        Payment payment = Payment.builder()
                .userId(userId)
                .registrationId(regId)
                .amount(new BigDecimal("500.00"))
                .transactionId("CBP_TXN_TEST12345")
                .build();
        payment.setId(UUID.randomUUID());

        // Mock PhonePe payment success response
        mockServer.expect(requestTo("https://api-preprod.phonepe.com/pg/v1/pay"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(request -> {
                    // Extract body and verify redirectUrl/callbackUrl in request
                    String requestBody = request.getBody().toString();
                    try {
                        JsonNode root = objectMapper.readTree(requestBody);
                        String base64Request = root.path("request").asText();
                        String decodedJson = new String(Base64.getDecoder().decode(base64Request), StandardCharsets.UTF_8);
                        JsonNode payload = objectMapper.readTree(decodedJson);

                        assertEquals(phonePeConfig.getRedirectUrl(), payload.path("redirectUrl").asText());
                        assertEquals(phonePeConfig.getCallbackUrl(), payload.path("callbackUrl").asText());
                        assertEquals(phonePeConfig.getClientId(), payload.path("merchantId").asText());
                        assertEquals("CBP_TXN_TEST12345", payload.path("merchantTransactionId").asText());
                        assertEquals(50000L, payload.path("amount").asLong()); // 500.00 INR = 50000 paise
                    } catch (Exception e) {
                        fail("Failed to parse/decode request body: " + e.getMessage());
                    }
                })
                .andRespond(withSuccess("{\"success\":true,\"code\":\"PAYMENT_INITIATED\",\"message\":\"Payment Initiated\",\"data\":{\"merchantId\":\"xxxxx\",\"merchantTransactionId\":\"tx_id\",\"instrumentResponse\":{\"type\":\"PAY_PAGE\",\"redirectInfo\":{\"url\":\"https://phonepe-payment-url\",\"method\":\"GET\"}}}}", MediaType.APPLICATION_JSON));

        String redirectUrl = phonePeGateway.initiatePayment(payment);
        assertEquals("https://phonepe-payment-url", redirectUrl);

        mockServer.verify();
    }
}

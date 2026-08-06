package com.cbp7.payment.gateway;

import com.cbp7.common.exception.PhonePeBadRequestException;
import com.cbp7.common.exception.PhonePeGatewayException;
import com.cbp7.payment.config.PhonePeConfig;
import com.cbp7.payment.dto.PhonePeStatusResponse;
import com.cbp7.payment.entity.Payment;
import com.phonepe.sdk.pg.payments.v2.StandardCheckoutClient;
import com.phonepe.sdk.pg.payments.v2.models.request.StandardCheckoutPayRequest;
import com.phonepe.sdk.pg.payments.v2.models.response.StandardCheckoutPayResponse;
import com.phonepe.sdk.pg.common.models.response.OrderStatusResponse;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@Transactional
class PhonePeGatewayTest {

    @Autowired
    private PaymentGateway paymentGateway;

    @Autowired
    private PhonePeGateway phonePeGateway;

    @Autowired
    private PhonePeConfig phonePeConfig;

    @MockitoBean
    private StandardCheckoutClient standardCheckoutClient;

    @Test
    void gatewayBeanShouldExist() {
        assertNotNull(paymentGateway);
        assertTrue(paymentGateway instanceof PhonePeGateway);
    }

    @Test
    void shouldInitiatePhonePePaymentSuccessfully() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID regId = UUID.randomUUID();
        Payment payment = Payment.builder()
                .userId(userId)
                .registrationId(regId)
                .amount(new BigDecimal("500.00"))
                .transactionId("CBP_TXN_TEST12345")
                .build();
        payment.setId(UUID.randomUUID());

        StandardCheckoutPayResponse mockResponse = mock(StandardCheckoutPayResponse.class);
        when(mockResponse.getRedirectUrl()).thenReturn("https://phonepe-payment-url");
        when(standardCheckoutClient.pay(any(StandardCheckoutPayRequest.class))).thenReturn(mockResponse);

        String redirectUrl = phonePeGateway.initiatePayment(payment);
        assertEquals("https://phonepe-payment-url", redirectUrl);

        ArgumentCaptor<StandardCheckoutPayRequest> requestCaptor = ArgumentCaptor.forClass(StandardCheckoutPayRequest.class);
        verify(standardCheckoutClient).pay(requestCaptor.capture());

        StandardCheckoutPayRequest capturedRequest = requestCaptor.getValue();
        assertEquals("CBP_TXN_TEST12345", capturedRequest.getMerchantOrderId());
        assertEquals(50000L, capturedRequest.getAmount());
        assertNotNull(capturedRequest.getMetaInfo());
        assertEquals(regId.toString(), capturedRequest.getMetaInfo().getUdf1());
        assertEquals(userId.toString(), capturedRequest.getMetaInfo().getUdf2());
    }

    @Test
    void checkPaymentStatus_Completed_ReturnsStatusResponse() throws Exception {
        OrderStatusResponse mockStatusResponse = mock(OrderStatusResponse.class);
        when(mockStatusResponse.getState()).thenReturn("COMPLETED");
        when(mockStatusResponse.getErrorCode()).thenReturn("PAYMENT_SUCCESS");
        when(standardCheckoutClient.getOrderStatus("CBP_TXN_TEST12345")).thenReturn(mockStatusResponse);

        PhonePeStatusResponse response = phonePeGateway.checkPaymentStatus("CBP_TXN_TEST12345");
        assertEquals("CBP_TXN_TEST12345", response.transactionId());
        assertEquals("COMPLETED", response.state());
        assertTrue(response.success());
        assertEquals("PAYMENT_SUCCESS", response.code());
    }

    @Test
    void initiatePayment_PhonePeReturns400_ThrowsPhonePeBadRequestException() throws Exception {
        com.phonepe.sdk.pg.common.exception.PhonePeException mockException = mock(com.phonepe.sdk.pg.common.exception.PhonePeException.class);
        when(mockException.getHttpStatusCode()).thenReturn(400);
        when(mockException.getCode()).thenReturn("BAD_REQUEST");
        when(mockException.getMessage()).thenReturn("Invalid request parameters");

        when(standardCheckoutClient.pay(any(StandardCheckoutPayRequest.class))).thenThrow(mockException);

        Payment payment = Payment.builder()
                .userId(UUID.randomUUID())
                .registrationId(UUID.randomUUID())
                .amount(new BigDecimal("500.00"))
                .transactionId("CBP_TXN_ERROR")
                .build();

        assertThrows(PhonePeBadRequestException.class, () -> phonePeGateway.initiatePayment(payment));
    }

    @Test
    void initiatePayment_PhonePeReturns500_ThrowsPhonePeGatewayException() throws Exception {
        com.phonepe.sdk.pg.common.exception.PhonePeException mockException = mock(com.phonepe.sdk.pg.common.exception.PhonePeException.class);
        when(mockException.getHttpStatusCode()).thenReturn(500);
        when(mockException.getCode()).thenReturn("INTERNAL_SERVER_ERROR");
        when(mockException.getMessage()).thenReturn("Provider server error");

        when(standardCheckoutClient.pay(any(StandardCheckoutPayRequest.class))).thenThrow(mockException);

        Payment payment = Payment.builder()
                .userId(UUID.randomUUID())
                .registrationId(UUID.randomUUID())
                .amount(new BigDecimal("500.00"))
                .transactionId("CBP_TXN_ERROR")
                .build();

        assertThrows(PhonePeGatewayException.class, () -> phonePeGateway.initiatePayment(payment));
    }
}

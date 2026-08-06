package com.cbp7.payment.gateway;

import com.cbp7.common.exception.PhonePeBadRequestException;
import com.cbp7.common.exception.PhonePeGatewayException;
import com.cbp7.payment.entity.Payment;
import com.phonepe.sdk.pg.payments.v2.StandardCheckoutClient;
import com.phonepe.sdk.pg.payments.v2.models.request.StandardCheckoutPayRequest;
import com.phonepe.sdk.pg.common.models.response.OrderStatusResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@SpringBootTest
@Transactional
class PhonePeErrorHandlingTest {

    @Autowired
    private PhonePeGateway phonePeGateway;

    @MockitoBean
    private StandardCheckoutClient standardCheckoutClient;

    private Payment payment;

    @BeforeEach
    void setUp() {
        payment = Payment.builder()
                .userId(UUID.randomUUID())
                .registrationId(UUID.randomUUID())
                .amount(new BigDecimal("500.00"))
                .transactionId("CBP_TXN_ERROR_TEST")
                .build();
        payment.setId(UUID.randomUUID());
    }

    @Test
    void initiatePayment_PhonePeReturns400_ThrowsPhonePeBadRequestException() throws Exception {
        com.phonepe.sdk.pg.common.exception.PhonePeException mockException = mock(com.phonepe.sdk.pg.common.exception.PhonePeException.class);
        when(mockException.getHttpStatusCode()).thenReturn(400);
        when(mockException.getCode()).thenReturn("BAD_REQUEST");
        when(mockException.getMessage()).thenReturn("Invalid request parameters");

        when(standardCheckoutClient.pay(any(StandardCheckoutPayRequest.class))).thenThrow(mockException);

        assertThrows(PhonePeBadRequestException.class, () -> phonePeGateway.initiatePayment(payment));
    }

    @Test
    void checkPaymentStatus_PhonePeReturns502_ThrowsPhonePeGatewayException() throws Exception {
        com.phonepe.sdk.pg.common.exception.PhonePeException mockException = mock(com.phonepe.sdk.pg.common.exception.PhonePeException.class);
        when(mockException.getHttpStatusCode()).thenReturn(502);
        when(mockException.getCode()).thenReturn("BAD_GATEWAY");
        when(mockException.getMessage()).thenReturn("Bad Gateway");

        when(standardCheckoutClient.getOrderStatus("CBP_TXN_ERROR_TEST")).thenThrow(mockException);

        assertThrows(PhonePeGatewayException.class, () -> phonePeGateway.checkPaymentStatus("CBP_TXN_ERROR_TEST"));
    }
}

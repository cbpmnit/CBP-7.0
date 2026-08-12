package com.cbp7.payment.gateway;

import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.dto.response.PhonePeStatusResponse;
import com.phonepe.sdk.pg.common.models.response.CallbackResponse;

public interface PaymentGateway {
    String initiatePayment(Payment payment);
    PhonePeStatusResponse checkPaymentStatus(String transactionId);
    CallbackResponse validateCallback(String authorization, String rawRequestBody);
}

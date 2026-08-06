package com.cbp7.payment.gateway;

import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.dto.PhonePeStatusResponse;

public interface PaymentGateway {
    String initiatePayment(Payment payment);
    PhonePeStatusResponse checkPaymentStatus(String transactionId);
}

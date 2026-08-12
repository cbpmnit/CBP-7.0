package com.cbp7.payment.service;

import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentStatus;

public interface PaymentVerificationService {
    Payment verifyPaymentStatus(String transactionId);
    void updatePaymentStatus(Payment payment, PaymentStatus newStatus);
    void completeSuccessfulPayment(Payment payment);
    void processCallback(String authorization, String rawRequestBody);
}

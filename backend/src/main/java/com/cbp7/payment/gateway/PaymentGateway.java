package com.cbp7.payment.gateway;

import com.cbp7.payment.entity.Payment;

public interface PaymentGateway {
    String initiatePayment(Payment payment);
}

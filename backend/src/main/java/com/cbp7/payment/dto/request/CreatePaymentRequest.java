package com.cbp7.payment.dto.request;

import com.cbp7.payment.entity.PaymentMode;
import jakarta.validation.constraints.NotNull;

public record CreatePaymentRequest(
        @NotNull(message = "Payment mode is required")
        PaymentMode paymentMode
) {}

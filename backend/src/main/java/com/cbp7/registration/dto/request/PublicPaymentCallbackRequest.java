package com.cbp7.registration.dto.request;

import jakarta.validation.constraints.NotBlank;

public record PublicPaymentCallbackRequest(
        @NotBlank(message = "Merchant order ID is required")
        String merchantOrderId,

        @NotBlank(message = "Status is required")
        String status,

        String gatewayTransactionId,

        String failureReason
) {}

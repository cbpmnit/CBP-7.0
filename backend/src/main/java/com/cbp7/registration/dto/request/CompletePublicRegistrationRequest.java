package com.cbp7.registration.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CompletePublicRegistrationRequest(
        @NotNull(message = "Registration ID is required")
        UUID registrationId,

        @NotBlank(message = "Merchant Order ID is required")
        String merchantOrderId,

        String gatewayTransactionId
) {}

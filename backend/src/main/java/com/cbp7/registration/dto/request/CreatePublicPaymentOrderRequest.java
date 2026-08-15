package com.cbp7.registration.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreatePublicPaymentOrderRequest(
        @NotNull(message = "Registration ID is required")
        UUID registrationId
) {}

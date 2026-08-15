package com.cbp7.registration.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record PublicOrderResponse(
        UUID registrationId,
        String merchantOrderId,
        BigDecimal amount,
        String redirectUrl,
        String paymentStatus
) {}

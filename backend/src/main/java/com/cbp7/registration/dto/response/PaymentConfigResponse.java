package com.cbp7.registration.dto.response;

import java.math.BigDecimal;

public record PaymentConfigResponse(
        BigDecimal amount,
        String currency
) {}

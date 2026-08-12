package com.cbp7.payment.dto.request;

import jakarta.validation.constraints.NotBlank;

public record PhonePeCallbackRequest(
        @NotBlank(message = "Response payload is required")
        String response
) {}

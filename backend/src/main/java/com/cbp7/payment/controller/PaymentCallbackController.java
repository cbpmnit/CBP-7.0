package com.cbp7.payment.controller;

import com.cbp7.common.response.ApiResponse;
import com.cbp7.payment.service.PaymentVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
public class PaymentCallbackController {

    private final PaymentVerificationService paymentVerificationService;

    @PostMapping("/phonepe/callback")
    public ResponseEntity<ApiResponse<Void>> handlePhonePeCallback(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody String rawRequestBody
    ) {
        paymentVerificationService.processCallback(authorizationHeader, rawRequestBody);
        return ResponseEntity.ok(ApiResponse.success("Callback processed successfully"));
    }
}

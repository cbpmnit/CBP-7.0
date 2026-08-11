package com.cbp7.payment.controller;

import com.cbp7.common.response.ApiResponse;
import com.cbp7.payment.service.PaymentVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentCallbackController {

    private final PaymentVerificationService paymentVerificationService;

    @PostMapping("/phonepe/callback")
    public ResponseEntity<ApiResponse<Void>> handlePhonePeCallback(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestHeader(value = "x-verify", required = false) String xVerifyHeader,
            @RequestBody String rawRequestBody
    ) {
        log.info("=== Incoming PhonePe Webhook Callback ===");
        log.info("Authorization Header: {}", authorizationHeader);
        log.info("X-Verify Header: {}", xVerifyHeader);
        log.info("Raw Request Body: {}", rawRequestBody);
        
        try {
            paymentVerificationService.processCallback(authorizationHeader, rawRequestBody);
            log.info("=== PhonePe Webhook Callback Processed Successfully ===");
            return ResponseEntity.ok(ApiResponse.success("Callback processed successfully"));
        } catch (Exception e) {
            log.error("=== PhonePe Webhook Callback Processing Failed: {} ===", e.getMessage(), e);
            throw e;
        }
    }
}

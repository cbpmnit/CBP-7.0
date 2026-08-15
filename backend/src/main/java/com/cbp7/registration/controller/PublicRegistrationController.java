package com.cbp7.registration.controller;

import com.cbp7.common.response.ApiResponse;
import com.cbp7.registration.dto.request.CompletePublicRegistrationRequest;
import com.cbp7.registration.dto.request.CreatePublicOrderRequest;
import com.cbp7.registration.dto.request.CreatePublicPaymentOrderRequest;
import com.cbp7.registration.dto.request.PublicPaymentCallbackRequest;
import com.cbp7.registration.dto.response.PaymentConfigResponse;
import com.cbp7.registration.dto.response.PublicOrderResponse;
import com.cbp7.registration.dto.response.PublicRegistrationStatusResponse;
import com.cbp7.registration.service.PublicRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/registration")
@RequiredArgsConstructor
public class PublicRegistrationController {

    private final PublicRegistrationService publicRegistrationService;

    @GetMapping("/payment-config")
    public ResponseEntity<ApiResponse<PaymentConfigResponse>> getPaymentConfig() {
        PaymentConfigResponse response = publicRegistrationService.getPaymentConfig();
        return ResponseEntity.ok(ApiResponse.success("Payment configuration retrieved successfully", response));
    }

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<PublicOrderResponse>> createOrder(
            @Valid @RequestBody CreatePublicOrderRequest request
    ) {
        PublicOrderResponse response = publicRegistrationService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration order created successfully", response));
    }

    @PostMapping("/payment/create")
    public ResponseEntity<ApiResponse<PublicOrderResponse>> initiatePaymentOrder(
            @Valid @RequestBody CreatePublicPaymentOrderRequest request
    ) {
        PublicOrderResponse response = publicRegistrationService.initiatePaymentOrder(request.registrationId());
        return ResponseEntity.ok(ApiResponse.success("Payment order created successfully", response));
    }

    @PostMapping("/payment/callback")
    public ResponseEntity<ApiResponse<PublicRegistrationStatusResponse>> processPaymentCallback(
            @Valid @RequestBody PublicPaymentCallbackRequest request
    ) {
        PublicRegistrationStatusResponse response = publicRegistrationService.processPaymentCallback(request);
        return ResponseEntity.ok(ApiResponse.success("Payment callback processed successfully", response));
    }

    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<PublicRegistrationStatusResponse>> completeRegistration(
            @Valid @RequestBody CompletePublicRegistrationRequest request
    ) {
        PublicRegistrationStatusResponse response = publicRegistrationService.completeRegistration(request);
        return ResponseEntity.ok(ApiResponse.success("Registration completed successfully", response));
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<ApiResponse<PublicRegistrationStatusResponse>> getRegistrationStatus(
            @PathVariable("id") UUID id
    ) {
        PublicRegistrationStatusResponse response = publicRegistrationService.getRegistrationStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Registration status retrieved successfully", response));
    }

    @GetMapping("/payment/{merchantOrderId}/status")
    public ResponseEntity<ApiResponse<PublicRegistrationStatusResponse>> getPaymentStatusByMerchantOrderId(
            @PathVariable("merchantOrderId") String merchantOrderId
    ) {
        PublicRegistrationStatusResponse response = publicRegistrationService.getPaymentStatusByMerchantOrderId(merchantOrderId);
        return ResponseEntity.ok(ApiResponse.success("Payment status retrieved successfully", response));
    }

    @GetMapping("/payment/status/{merchantOrderId}")
    public ResponseEntity<ApiResponse<PublicRegistrationStatusResponse>> getPaymentStatusByMerchantOrderIdAlias(
            @PathVariable("merchantOrderId") String merchantOrderId
    ) {
        PublicRegistrationStatusResponse response = publicRegistrationService.getPaymentStatusByMerchantOrderId(merchantOrderId);
        return ResponseEntity.ok(ApiResponse.success("Payment status retrieved successfully", response));
    }
}

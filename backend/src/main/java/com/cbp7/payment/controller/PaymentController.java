package com.cbp7.payment.controller;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.common.response.ApiResponse;
import com.cbp7.payment.dto.request.CreatePaymentRequest;
import com.cbp7.payment.dto.request.PhonePeCallbackRequest;
import com.cbp7.payment.dto.response.PaymentDetailResponse;
import com.cbp7.payment.dto.response.PaymentResponse;
import com.cbp7.payment.dto.response.PaymentStatusResponse;
import com.cbp7.payment.dto.response.PhonePePaymentResponse;
import com.cbp7.payment.dto.response.PhonePeStatusDetailsResponse;
import com.cbp7.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreatePaymentRequest request
    ) {
        PaymentResponse response = paymentService.createPayment(user, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment initiated successfully", response));
    }

    @PostMapping("/phonepe/initiate")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PhonePePaymentResponse>> initiatePhonePePayment(
            @AuthenticationPrincipal User user
    ) {
        PhonePePaymentResponse response = paymentService.initiatePhonePePayment(user);
        return ResponseEntity.ok(ApiResponse.success("Payment initiated successfully", response));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PaymentDetailResponse>> getMyPayment(@AuthenticationPrincipal User user) {
        PaymentDetailResponse response = paymentService.getMyPayment(user);
        return ResponseEntity.ok(ApiResponse.success("Payment details retrieved successfully", response));
    }

    @GetMapping("/{transactionId}/status")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> getPaymentStatus(
            @AuthenticationPrincipal User user,
            @PathVariable String transactionId
    ) {
        PaymentStatusResponse response = paymentService.verifyAndGetPaymentStatus(user, transactionId);
        return ResponseEntity.ok(ApiResponse.success("Payment status retrieved successfully", response));
    }

    @GetMapping("/status/{transactionId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PhonePeStatusDetailsResponse>> getStatusDetails(
            @AuthenticationPrincipal User user,
            @PathVariable String transactionId
    ) {
        PhonePeStatusDetailsResponse response = paymentService.verifyAndGetStatusDetails(user, transactionId);
        return ResponseEntity.ok(ApiResponse.success("Payment status retrieved successfully", response));
    }
}

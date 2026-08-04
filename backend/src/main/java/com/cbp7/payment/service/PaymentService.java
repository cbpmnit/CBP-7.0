package com.cbp7.payment.service;

import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.common.exception.CbpRegistrationRequiredException;
import com.cbp7.common.exception.ForbiddenException;
import com.cbp7.common.exception.PaymentAlreadyExistsException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.common.exception.UnauthorizedException;
import com.cbp7.payment.dto.CreatePaymentRequest;
import com.cbp7.payment.dto.PaymentDetailResponse;
import com.cbp7.payment.dto.PaymentResponse;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    public static final BigDecimal CBP_REGISTRATION_FEE = new BigDecimal("500.00");

    private final PaymentRepository paymentRepository;
    private final CbpRegistrationRepository cbpRegistrationRepository;

    @Transactional
    public PaymentResponse createPayment(User user, CreatePaymentRequest request) {
        validateStudentRole(user);

        // Find CBP registration of current user
        CbpRegistration registration = cbpRegistrationRepository.findByUserStudentIdIgnoreCase(user.getStudentId())
                .orElseThrow(() -> new CbpRegistrationRequiredException("Please complete CBP registration first."));

        // Check if successful payment already exists
        boolean hasSuccessfulPayment = paymentRepository.existsByRegistrationIdAndPaymentStatus(
                registration.getId(), PaymentStatus.SUCCESS
        );
        if (hasSuccessfulPayment) {
            throw new PaymentAlreadyExistsException("Payment already completed.");
        }

        // Create Payment record
        Payment payment = Payment.builder()
                .registrationId(registration.getId())
                .userId(user.getId())
                .paymentMode(request.paymentMode())
                .paymentStatus(PaymentStatus.PENDING)
                .amount(CBP_REGISTRATION_FEE)
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        return new PaymentResponse(
                savedPayment.getId(),
                savedPayment.getPaymentMode(),
                savedPayment.getPaymentStatus(),
                savedPayment.getAmount()
        );
    }

    @Transactional(readOnly = true)
    public PaymentDetailResponse getMyPayment(User user) {
        validateStudentRole(user);

        List<Payment> payments = paymentRepository.findByUserId(user.getId());
        if (payments.isEmpty()) {
            throw new ResourceNotFoundException("No payment record found for current user.");
        }

        // Prioritize SUCCESS status, otherwise return the most recent attempt
        Payment payment = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .findFirst()
                .orElseGet(() -> payments.stream()
                        .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No payment record found for current user.")));

        return new PaymentDetailResponse(
                payment.getId(),
                payment.getPaymentMode(),
                payment.getPaymentStatus(),
                payment.getAmount(),
                payment.getCreatedAt()
        );
    }

    private void validateStudentRole(User user) {
        if (user == null) {
            throw new UnauthorizedException("User is not authenticated.");
        }
        if (user.getRole() != Role.ROLE_STUDENT) {
            throw new ForbiddenException("Only students can perform payment actions.");
        }
    }
}

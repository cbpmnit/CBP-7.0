package com.cbp7.payment.mapper;

import com.cbp7.payment.dto.response.PaymentDetailResponse;
import com.cbp7.payment.dto.response.PaymentResponse;
import com.cbp7.payment.dto.response.PaymentStatusResponse;
import com.cbp7.payment.dto.response.PhonePePaymentResponse;
import com.cbp7.payment.dto.response.PhonePeStatusDetailsResponse;
import com.cbp7.payment.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponse toPaymentResponse(Payment payment) {
        if (payment == null) {
            return null;
        }

        return new PaymentResponse(
                payment.getId(),
                payment.getPaymentMode(),
                payment.getPaymentStatus(),
                payment.getAmount()
        );
    }

    public PhonePePaymentResponse toPhonePePaymentResponse(Payment payment, String redirectUrl) {
        if (payment == null) {
            return null;
        }

        return new PhonePePaymentResponse(
                payment.getId(),
                payment.getTransactionId(),
                redirectUrl,
                payment.getPaymentStatus()
        );
    }

    public PaymentDetailResponse toPaymentDetailResponse(Payment payment) {
        if (payment == null) {
            return null;
        }

        return new PaymentDetailResponse(
                payment.getId(),
                payment.getTransactionId(),
                payment.getPaymentMode(),
                payment.getPaymentStatus(),
                payment.getAmount(),
                payment.getCreatedAt()
        );
    }

    public PaymentStatusResponse toPaymentStatusResponse(Payment payment) {
        if (payment == null) {
            return null;
        }

        return new PaymentStatusResponse(
                payment.getTransactionId(),
                payment.getPaymentStatus(),
                payment.getAmount(),
                payment.getUpdatedAt(),
                payment.getRegistrationId(),
                payment.getCreatedAt()
        );
    }

    public PhonePeStatusDetailsResponse toPhonePeStatusDetailsResponse(Payment payment, String gatewayStatus) {
        if (payment == null) {
            return null;
        }

        return new PhonePeStatusDetailsResponse(
                payment.getId(),
                payment.getTransactionId(),
                payment.getPaymentStatus(),
                payment.getAmount(),
                gatewayStatus
        );
    }
}

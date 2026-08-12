package com.cbp7.payment;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.entity.PaymentMode;
import com.cbp7.payment.entity.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PaymentTransactionFactory {

    private final PaymentRepository paymentRepository;

    public Payment createPendingPayment(User user, CbpRegistration registration, PaymentMode mode, BigDecimal amount) {
        Payment payment = Payment.builder()
                .registrationId(registration.getId())
                .userId(user.getId())
                .paymentMode(mode)
                .paymentStatus(PaymentStatus.PENDING)
                .amount(amount)
                .build();

        return paymentRepository.save(payment);
    }

    public Payment findOrCreateInitiatedPayment(List<Payment> payments, CbpRegistration registration, User user, BigDecimal amount) {
        Payment payment = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.PENDING
                        || p.getPaymentStatus() == PaymentStatus.INITIATED
                        || p.getPaymentStatus() == PaymentStatus.PROCESSING
                        || p.getPaymentStatus() == PaymentStatus.FAILED)
                .findFirst()
                .orElseGet(() -> {
                    Payment newPayment = Payment.builder()
                            .registrationId(registration.getId())
                            .userId(user.getId())
                            .paymentMode(PaymentMode.ONLINE)
                            .paymentStatus(PaymentStatus.INITIATED)
                            .amount(amount)
                            .build();
                    return paymentRepository.save(newPayment);
                });

        String newTxnId = generateTransactionId();
        payment.setTransactionId(newTxnId);
        payment.setPaymentMode(PaymentMode.ONLINE);
        payment.setPaymentStatus(PaymentStatus.INITIATED);

        return paymentRepository.saveAndFlush(payment);
    }

    public String generateTransactionId() {
        return "CBP_TXN_" + UUID.randomUUID().toString().replace("-", "");
    }
}

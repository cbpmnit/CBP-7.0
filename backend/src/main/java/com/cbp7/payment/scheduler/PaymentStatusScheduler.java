package com.cbp7.payment.scheduler;

import com.cbp7.payment.config.PhonePeConfig;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.payment.service.PaymentVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentStatusScheduler {

    private final PaymentRepository paymentRepository;
    private final PaymentVerificationService paymentVerificationService;
    private final PhonePeConfig phonePeConfig;

    @Scheduled(cron = "${phonepe.scheduler.cron:0 */5 * * * *}")
    public void reconcilePendingPayments() {
        log.info("Starting background payment reconciliation scheduler...");
        
        int thresholdMinutes = phonePeConfig.getReconciliationMinutes();
        LocalDateTime thresholdTime = LocalDateTime.now().minusMinutes(thresholdMinutes);

        List<Payment> pendingPayments = paymentRepository.findAllByPaymentStatusAndCreatedAtBefore(
                PaymentStatus.PENDING, thresholdTime
        );

        log.info("Found {} pending payments older than {} minutes for reconciliation.", pendingPayments.size(), thresholdMinutes);

        for (Payment payment : pendingPayments) {
            try {
                log.info("Reconciling payment transaction ID: {}", payment.getTransactionId());
                paymentVerificationService.verifyPaymentStatus(payment.getTransactionId());
            } catch (Exception e) {
                log.error("Failed to reconcile payment for transaction ID {}: {}", payment.getTransactionId(), e.getMessage());
            }
        }
        
        log.info("Finished background payment reconciliation.");
    }
}

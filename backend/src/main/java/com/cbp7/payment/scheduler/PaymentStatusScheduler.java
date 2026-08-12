package com.cbp7.payment.scheduler;

import com.cbp7.payment.config.PhonePeConfig;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.payment.service.PaymentVerificationService;
import com.cbp7.payment.gateway.PaymentGateway;
import com.cbp7.payment.dto.response.PhonePeStatusResponse;
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
    private final PaymentGateway paymentGateway;

    @Scheduled(cron = "${phonepe.scheduler.cron:0 */5 * * * *}") // every 5 mintes method execute
    public void reconcilePendingPayments() {
        log.info("Starting background payment reconciliation scheduler...");
        
        List<PaymentStatus> activeStatuses = List.of(
                PaymentStatus.PENDING,
                PaymentStatus.INITIATED,
                PaymentStatus.PROCESSING,
                PaymentStatus.UNDER_VERIFICATION
        );

        List<Payment> activePayments = paymentRepository.findAllByPaymentStatusIn(activeStatuses);
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime maxAgeCutoff = now.minusHours(phonePeConfig.getReconciliationMaxAgeHours());
        
        List<Payment> toReconcile = activePayments.stream()
                .filter(p -> p.getCreatedAt() != null && p.getUpdatedAt() != null)
                .filter(p -> p.getCreatedAt().isAfter(maxAgeCutoff))
                .filter(p -> {
                    long ageInMinutes = java.time.Duration.between(p.getCreatedAt(), now).toMinutes();
                    long minutesSinceLastUpdate = java.time.Duration.between(p.getUpdatedAt(), now).toMinutes();
                    
                    // Always check very new payments (age < 15 mins) on every run to capture recent checkout updates
                    if (ageInMinutes < phonePeConfig.getReconciliationMinutes()) {
                        return true;
                    }
                    // For older active payments, apply backoff check (only check if last check was >= 5 mins ago)
                    return minutesSinceLastUpdate >= 5;
                })
                .toList();

        log.info("Found {} active payments matching reconciliation criteria.", toReconcile.size());

        for (Payment payment : toReconcile) {
            log.info("Payment reconciliation started");
            log.info("Transaction ID: {}", payment.getTransactionId());
            log.info("Previous status: {}", payment.getPaymentStatus());
            
            String phonepeStatus = "PENDING";
            try {
                PhonePeStatusResponse gatewayStatus = paymentGateway.checkPaymentStatus(payment.getTransactionId());
                phonepeStatus = gatewayStatus.state();
            } catch (Exception ge) {
                log.warn("Unable to fetch PhonePe status during reconciliation for transaction {}: {}", payment.getTransactionId(), ge.getMessage());
            }
            log.info("PhonePe status: {}", phonepeStatus);

            try {
                Payment verifiedPayment = paymentVerificationService.verifyPaymentStatus(payment.getTransactionId());
                log.info("Updated status: {}", verifiedPayment.getPaymentStatus());
            } catch (Exception e) {
                log.error("Failed to reconcile payment for transaction ID {}: {}", payment.getTransactionId(), e.getMessage());
            }
        }
        
        log.info("Finished background payment reconciliation.");
    }
}

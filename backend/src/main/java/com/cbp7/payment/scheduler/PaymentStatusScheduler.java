package com.cbp7.payment.scheduler;

import com.cbp7.payment.config.PhonePeConfig;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.payment.service.PaymentVerificationService;
import com.cbp7.payment.gateway.PaymentGateway;
import com.cbp7.payment.dto.PhonePeStatusResponse;
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

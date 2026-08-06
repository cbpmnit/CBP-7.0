package com.cbp7.payment.scheduler;

import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.payment.service.PaymentVerificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.Mockito.*;

@SpringBootTest
@Transactional
class PaymentStatusSchedulerTest {

    @Autowired
    private PaymentStatusScheduler paymentStatusScheduler;

    @MockitoBean
    private PaymentRepository paymentRepository;

    @MockitoBean
    private PaymentVerificationService paymentVerificationService;

    @Test
    void reconcilePendingPayments_FindsPendingAndTriggersReconciliation() {
        Payment mockPayment = Payment.builder()
                .id(UUID.randomUUID())
                .transactionId("CBP_TXN_SCHEDULER_TEST")
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        when(paymentRepository.findAllByPaymentStatusAndCreatedAtBefore(eq(PaymentStatus.PENDING), any(LocalDateTime.class)))
                .thenReturn(Collections.singletonList(mockPayment));

        paymentStatusScheduler.reconcilePendingPayments();

        verify(paymentVerificationService).verifyPaymentStatus("CBP_TXN_SCHEDULER_TEST");
    }
}

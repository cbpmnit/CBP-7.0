package com.cbp7.payment.repository;

import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByRegistrationId(UUID registrationId);
    List<Payment> findByUserId(UUID userId);
    boolean existsByRegistrationIdAndPaymentStatus(UUID registrationId, PaymentStatus paymentStatus);
    boolean existsByUserIdAndPaymentStatus(UUID userId, PaymentStatus paymentStatus);
    
    Optional<Payment> findByTransactionId(String transactionId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Payment p WHERE p.transactionId = :transactionId")
    Optional<Payment> findByTransactionIdWithLock(String transactionId);

    List<Payment> findAllByPaymentStatusAndCreatedAtBefore(PaymentStatus paymentStatus, LocalDateTime thresholdTime);
    List<Payment> findAllByPaymentStatusIn(List<PaymentStatus> statuses);
}

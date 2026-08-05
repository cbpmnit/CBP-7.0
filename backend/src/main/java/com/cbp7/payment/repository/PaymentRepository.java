package com.cbp7.payment.repository;

import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByRegistrationId(UUID registrationId);
    List<Payment> findByUserId(UUID userId);
    boolean existsByRegistrationIdAndPaymentStatus(UUID registrationId, PaymentStatus paymentStatus);
}

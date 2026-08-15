package com.cbp7.registration.repository;

import com.cbp7.registration.entity.PublicPaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PublicPaymentTransactionRepository extends JpaRepository<PublicPaymentTransaction, UUID> {
    Optional<PublicPaymentTransaction> findByMerchantOrderId(String merchantOrderId);
    List<PublicPaymentTransaction> findByRegistrationId(UUID registrationId);
    Optional<PublicPaymentTransaction> findTopByRegistrationIdOrderByCreatedAtDesc(UUID registrationId);
}

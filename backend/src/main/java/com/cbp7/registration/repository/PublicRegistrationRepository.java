package com.cbp7.registration.repository;

import com.cbp7.registration.entity.PublicRegistration;
import com.cbp7.registration.enums.PublicRegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PublicRegistrationRepository extends JpaRepository<PublicRegistration, UUID> {
    Optional<PublicRegistration> findByEmailIgnoreCase(String email);
    Optional<PublicRegistration> findByStudentIdIgnoreCase(String studentId);
    Optional<PublicRegistration> findByMobileNumber(String mobileNumber);
    Optional<PublicRegistration> findTopByStudentIdIgnoreCaseOrderByCreatedAtDesc(String studentId);
    Optional<PublicRegistration> findTopByMobileNumberOrderByCreatedAtDesc(String mobileNumber);
    boolean existsByEmailIgnoreCaseAndPaymentStatus(String email, PublicRegistrationStatus paymentStatus);
    boolean existsByStudentIdIgnoreCaseAndPaymentStatus(String studentId, PublicRegistrationStatus paymentStatus);
}

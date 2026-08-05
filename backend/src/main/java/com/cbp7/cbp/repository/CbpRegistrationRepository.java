package com.cbp7.cbp.repository;

import com.cbp7.auth.entity.User;
import com.cbp7.cbp.entity.CbpRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CbpRegistrationRepository extends JpaRepository<CbpRegistration, UUID> {
    Optional<CbpRegistration> findByUser(User user);
    Optional<CbpRegistration> findByUserId(UUID userId);
    Optional<CbpRegistration> findByRegistrationId(String registrationId);
    Optional<CbpRegistration> findByUserStudentIdIgnoreCase(String studentId);
    boolean existsByUser(User user);
    boolean existsByUserId(UUID userId);
    boolean existsByUserStudentIdIgnoreCase(String studentId);
}

package com.cbp7.certificate.repository;

import com.cbp7.certificate.entity.Certificate;
import com.cbp7.certificate.entity.CertificateType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, UUID> {
    Optional<Certificate> findByStudentId(String studentId);
    Optional<Certificate> findByStudentIdAndCertificateType(String studentId, CertificateType certificateType);
    Optional<Certificate> findByCertificateNumber(String certificateNumber);
    boolean existsByStudentId(String studentId);
    boolean existsByStudentIdAndCertificateType(String studentId, CertificateType certificateType);
    boolean existsByCertificateNumber(String certificateNumber);
}

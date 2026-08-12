package com.cbp7.program.certificate.repository;

import com.cbp7.program.certificate.entity.Certificate;
import com.cbp7.program.certificate.entity.CertificateType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CertificateRepository extends JpaRepository<Certificate, UUID> {
    Optional<Certificate> findByStudentId(String studentId);
    Optional<Certificate> findByStudentIdAndCertificateType(String studentId, CertificateType certificateType);
    Optional<Certificate> findByCertificateNumber(String certificateNumber);
    boolean existsByStudentId(String studentId);
    boolean existsByStudentIdAndCertificateType(String studentId, CertificateType certificateType);
    boolean existsByCertificateNumber(String certificateNumber);
}

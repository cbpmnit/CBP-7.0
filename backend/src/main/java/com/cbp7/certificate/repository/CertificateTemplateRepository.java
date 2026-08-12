package com.cbp7.certificate.repository;

import com.cbp7.certificate.entity.CertificateTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CertificateTemplateRepository extends JpaRepository<CertificateTemplate, UUID> {
    Optional<CertificateTemplate> findByStatus(String status);
    List<CertificateTemplate> findAllByOrderByCreatedAtDesc();
    Optional<CertificateTemplate> findFirstByStatusOrderByUpdatedAtDesc(String status);
}

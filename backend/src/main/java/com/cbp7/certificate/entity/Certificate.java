package com.cbp7.certificate.entity;

import com.cbp7.auth.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(schema = "program", name = "certificates")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Certificate extends BaseEntity {

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "template_id")
    private UUID templateId;

    @Column(name = "certificate_number", nullable = false, unique = true)
    private String certificateNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "certificate_type", nullable = false)
    @Builder.Default
    private CertificateType certificateType = CertificateType.PARTICIPATION;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private CertificateStatus status = CertificateStatus.GENERATED;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;
}

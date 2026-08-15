package com.cbp7.registration.entity;

import com.cbp7.registration.enums.PublicRegistrationAuditEventType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "public_registration_audit_logs", schema = "registration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicRegistrationAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "registration_id")
    private UUID registrationId;

    @Column(name = "payment_transaction_id")
    private UUID paymentTransactionId;

    @Column(name = "merchant_order_id", length = 100)
    private String merchantOrderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 100)
    private PublicRegistrationAuditEventType eventType;

    @Column(length = 500)
    private String message;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}

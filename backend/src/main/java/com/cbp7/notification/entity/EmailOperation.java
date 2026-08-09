package com.cbp7.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_operations", schema = "platform")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "template_id")
    private UUID templateId;

    @Column(name = "recipient_type", nullable = false, length = 50)
    private String recipientType; // PAID_STUDENTS, ALL_STUDENTS, CUSTOM_FILTER, INDIVIDUAL

    @Column(columnDefinition = "TEXT")
    private String filters; // JSON string of filter parameters

    @Builder.Default
    @Column(length = 50)
    private String status = "COMPLETED"; // DRAFT, SCHEDULED, IN_PROGRESS, COMPLETED, FAILED

    @Builder.Default
    @Column(name = "trigger_type", length = 50)
    private String triggerType = "MANUAL"; // MANUAL, EVENT_TRIGGER, SCHEDULED

    @Builder.Default
    @Column(name = "total_recipients")
    private Integer totalRecipients = 0;

    @Builder.Default
    @Column(name = "sent_count")
    private Integer sentCount = 0;

    @Builder.Default
    @Column(name = "failed_count")
    private Integer failedCount = 0;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @CreationTimestamp
    @Column(name = "executed_at")
    private LocalDateTime executedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

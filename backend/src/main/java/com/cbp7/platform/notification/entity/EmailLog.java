package com.cbp7.platform.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_logs", schema = "platform")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "operation_id")
    private UUID operationId;

    @Column(name = "template_id")
    private UUID templateId;

    @Column(name = "template_name", length = 200)
    private String templateName;

    @Column(nullable = false, length = 255)
    private String recipient;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "SENT"; // PENDING, SENT, FAILED

    @CreationTimestamp
    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

package com.cbp7.notification.entity;

import com.cbp7.auth.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    schema = "notification",
    name = "notification_templates",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_notification_template_name", columnNames = {"name"}),
        @UniqueConstraint(name = "uq_notification_template_type_channel", columnNames = {"type", "channel"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class NotificationTemplate extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private NotificationType type;

    @Column
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(columnDefinition = "TEXT")
    private String variables;

    @Column(name = "created_by", nullable = false)
    private String createdBy;
}

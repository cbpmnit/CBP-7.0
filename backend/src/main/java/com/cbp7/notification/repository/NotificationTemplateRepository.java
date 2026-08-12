package com.cbp7.notification.repository;

import com.cbp7.notification.entity.NotificationChannel;
import com.cbp7.notification.entity.NotificationTemplate;
import com.cbp7.notification.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, UUID> {
    Optional<NotificationTemplate> findByTypeAndChannel(NotificationType type, NotificationChannel channel);
    Optional<NotificationTemplate> findByTypeAndChannelAndStatus(NotificationType type, NotificationChannel channel, String status);
    Optional<NotificationTemplate> findByEventTypeAndChannelAndStatus(String eventType, NotificationChannel channel, String status);
    List<NotificationTemplate> findByStatus(String status);
    boolean existsByName(String name);
    boolean existsByTypeAndChannel(NotificationType type, NotificationChannel channel);
}

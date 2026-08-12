package com.cbp7.platform.notification.repository;

import com.cbp7.platform.notification.entity.NotificationChannel;
import com.cbp7.platform.notification.entity.NotificationTemplate;
import com.cbp7.platform.notification.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, UUID> {
    Optional<NotificationTemplate> findByTypeAndChannel(NotificationType type, NotificationChannel channel);
    Optional<NotificationTemplate> findByTypeAndChannelAndStatus(NotificationType type, NotificationChannel channel, String status);
    Optional<NotificationTemplate> findFirstByTypeAndChannelAndStatus(NotificationType type, NotificationChannel channel, String status);
    Optional<NotificationTemplate> findByEventTypeAndChannelAndStatus(String eventType, NotificationChannel channel, String status);
    Optional<NotificationTemplate> findFirstByEventTypeAndChannelAndStatus(String eventType, NotificationChannel channel, String status);
    List<NotificationTemplate> findByEventTypeAndChannel(String eventType, NotificationChannel channel);
    List<NotificationTemplate> findByStatus(String status);
    long countByStatus(String status);
    boolean existsByName(String name);
    boolean existsByTypeAndChannel(NotificationType type, NotificationChannel channel);
}

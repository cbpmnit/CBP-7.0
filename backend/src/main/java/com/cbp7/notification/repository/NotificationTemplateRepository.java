package com.cbp7.notification.repository;

import com.cbp7.notification.entity.NotificationTemplate;
import com.cbp7.notification.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, UUID> {
    Optional<NotificationTemplate> findByType(NotificationType type);
}

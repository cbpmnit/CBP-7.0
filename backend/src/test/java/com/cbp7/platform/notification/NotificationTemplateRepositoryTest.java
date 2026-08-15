package com.cbp7.platform.notification;

import com.cbp7.platform.notification.entity.NotificationChannel;
import com.cbp7.platform.notification.entity.NotificationTemplate;
import com.cbp7.platform.notification.entity.NotificationType;
import com.cbp7.platform.notification.repository.NotificationTemplateRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS identity; CREATE SCHEMA IF NOT EXISTS program; CREATE SCHEMA IF NOT EXISTS platform; CREATE SCHEMA IF NOT EXISTS registration;"
})
class NotificationTemplateRepositoryTest {

    @Autowired
    private NotificationTemplateRepository notificationTemplateRepository;

    @Test
    @DisplayName("findByTypeAndChannel returns matching template")
    void findByTypeAndChannelReturnsTemplate() {
        NotificationTemplate template = NotificationTemplate.builder()
                .name("Payment Email")
                .channel(NotificationChannel.EMAIL)
                .type(NotificationType.PAYMENT_SUCCESS)
                .content("Content")
                .createdBy("ADMIN001")
                .build();
        notificationTemplateRepository.save(template);

        Optional<NotificationTemplate> found = notificationTemplateRepository
                .findByTypeAndChannel(NotificationType.PAYMENT_SUCCESS, NotificationChannel.EMAIL);

        assertTrue(found.isPresent());
        assertEquals("Payment Email", found.get().getName());
    }

    @Test
    @DisplayName("Duplicate template name throws DataIntegrityViolationException")
    void duplicateNameThrowsException() {
        NotificationTemplate t1 = NotificationTemplate.builder()
                .name("Unique Template")
                .channel(NotificationChannel.EMAIL)
                .type(NotificationType.REGISTRATION_SUCCESS)
                .content("Content 1")
                .createdBy("ADMIN001")
                .build();
        notificationTemplateRepository.saveAndFlush(t1);

        NotificationTemplate t2 = NotificationTemplate.builder()
                .name("Unique Template")
                .channel(NotificationChannel.WHATSAPP)
                .type(NotificationType.PAYMENT_SUCCESS)
                .content("Content 2")
                .createdBy("ADMIN001")
                .build();

        assertThrows(DataIntegrityViolationException.class, () -> notificationTemplateRepository.saveAndFlush(t2));
    }

    @Test
    @DisplayName("Duplicate type and channel throws DataIntegrityViolationException")
    void duplicateTypeAndChannelThrowsException() {
        NotificationTemplate t1 = NotificationTemplate.builder()
                .name("Template 1")
                .channel(NotificationChannel.EMAIL)
                .type(NotificationType.PAYMENT_SUCCESS)
                .content("Content 1")
                .createdBy("ADMIN001")
                .build();
        notificationTemplateRepository.saveAndFlush(t1);

        NotificationTemplate t2 = NotificationTemplate.builder()
                .name("Template 2")
                .channel(NotificationChannel.EMAIL)
                .type(NotificationType.PAYMENT_SUCCESS)
                .content("Content 2")
                .createdBy("ADMIN001")
                .build();

        assertThrows(DataIntegrityViolationException.class, () -> notificationTemplateRepository.saveAndFlush(t2));
    }
}

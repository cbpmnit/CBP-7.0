package com.cbp7.notification;

import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.notification.email.EmailSender;
import com.cbp7.notification.entity.NotificationChannel;
import com.cbp7.notification.entity.NotificationTemplate;
import com.cbp7.notification.entity.NotificationType;
import com.cbp7.notification.processor.TemplateProcessorService;
import com.cbp7.notification.repository.NotificationTemplateRepository;
import com.cbp7.notification.service.EmailNotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS cbp; CREATE SCHEMA IF NOT EXISTS profile; CREATE SCHEMA IF NOT EXISTS payment; CREATE SCHEMA IF NOT EXISTS notification;"
})
class EmailNotificationServiceTest {

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private TemplateProcessorService templateProcessorService;

    @Autowired
    private NotificationTemplateRepository notificationTemplateRepository;

    @MockitoBean
    private EmailSender emailSender;

    @BeforeEach
    void setUp() {
        notificationTemplateRepository.deleteAll();
    }

    @Test
    @DisplayName("1. Template variables are replaced correctly")
    void templateVariablesReplacedCorrectly() {
        String template = "Hello {{studentName}}, your registration ID is {{registrationId}}.";
        Map<String, String> variables = Map.of(
                "studentName", "Parv",
                "registrationId", "CBP12345"
        );

        String result = templateProcessorService.processTemplate(template, variables);

        assertEquals("Hello Parv, your registration ID is CBP12345.", result);
    }

    @Test
    @DisplayName("2. EmailSender is called with correct recipient, subject, and body")
    void emailSenderCalledWithCorrectDetails() {
        NotificationTemplate template = NotificationTemplate.builder()
                .name("Welcome Email")
                .channel(NotificationChannel.EMAIL)
                .type(NotificationType.REGISTRATION_SUCCESS)
                .subject("Welcome {{studentName}}")
                .content("<h2>Hello {{studentName}}</h2><p>ID: {{registrationId}}</p>")
                .createdBy("ADMIN001")
                .build();
        NotificationTemplate saved = notificationTemplateRepository.save(template);

        Map<String, String> variables = Map.of(
                "studentName", "Parv",
                "registrationId", "CBP12345"
        );

        emailNotificationService.sendTemplateEmail(saved.getId(), "parv@example.com", variables);

        verify(emailSender).sendEmail(
                "parv@example.com",
                "Welcome Parv",
                "<h2>Hello Parv</h2><p>ID: CBP12345</p>"
        );
    }

    @Test
    @DisplayName("3. sendTemplateEmailByType uses type and channel")
    void sendTemplateEmailByTypeUsesTypeAndChannel() {
        NotificationTemplate template = NotificationTemplate.builder()
                .name("Payment Email")
                .channel(NotificationChannel.EMAIL)
                .type(NotificationType.PAYMENT_SUCCESS)
                .subject("Payment {{paymentId}}")
                .content("Amount {{amount}}")
                .createdBy("ADMIN001")
                .build();
        notificationTemplateRepository.save(template);

        Map<String, String> variables = Map.of(
                "paymentId", "PAY100",
                "amount", "5000"
        );

        emailNotificationService.sendTemplateEmailByType(NotificationType.PAYMENT_SUCCESS, "student@example.com", variables);

        verify(emailSender).sendEmail("student@example.com", "Payment PAY100", "Amount 5000");
    }

    @Test
    @DisplayName("4. Missing template throws ResourceNotFoundException")
    void missingTemplateThrowsResourceNotFoundException() {
        UUID nonExistentId = UUID.randomUUID();
        Map<String, String> variables = Map.of();

        assertThrows(ResourceNotFoundException.class, () ->
                emailNotificationService.sendTemplateEmail(nonExistentId, "test@example.com", variables)
        );
    }

    @Test
    @DisplayName("5. Invalid or missing variables do not break processing")
    void invalidVariablesHandledGracefully() {
        String template = "Hello {{studentName}}, welcome to {{course}}!";
        Map<String, String> partialVariables = Map.of("studentName", "Parv");

        String result = templateProcessorService.processTemplate(template, partialVariables);

        assertEquals("Hello Parv, welcome to {{course}}!", result);
    }
}

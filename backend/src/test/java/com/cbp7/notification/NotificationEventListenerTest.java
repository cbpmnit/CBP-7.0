package com.cbp7.notification;

import com.cbp7.notification.email.EmailSender;
import com.cbp7.notification.entity.NotificationChannel;
import com.cbp7.notification.entity.NotificationTemplate;
import com.cbp7.notification.entity.NotificationType;
import com.cbp7.notification.event.CertificateGeneratedEvent;
import com.cbp7.notification.event.NotificationEventPublisher;
import com.cbp7.notification.event.PaymentSuccessfulEvent;
import com.cbp7.notification.event.StudentRegisteredEvent;
import com.cbp7.notification.repository.NotificationTemplateRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS cbp; CREATE SCHEMA IF NOT EXISTS profile; CREATE SCHEMA IF NOT EXISTS payment; CREATE SCHEMA IF NOT EXISTS notification;"
})
class NotificationEventListenerTest {

    @Autowired
    private NotificationEventPublisher notificationEventPublisher;

    @Autowired
    private NotificationTemplateRepository notificationTemplateRepository;

    @MockitoBean
    private EmailSender emailSender;

    @BeforeEach
    @AfterEach
    void cleanUp() {
        notificationTemplateRepository.deleteAll();
    }

    @Test
    @DisplayName("1. PaymentSuccessfulEvent published triggers email notification")
    void paymentSuccessfulEventTriggersEmail() {
        NotificationTemplate template = NotificationTemplate.builder()
                .name("Payment Confirmation")
                .channel(NotificationChannel.EMAIL)
                .type(NotificationType.PAYMENT_SUCCESS)
                .subject("Payment Successful - {{paymentId}}")
                .content("Dear {{studentName}}, your payment of INR {{amount}} for ID {{paymentId}} was received.")
                .createdBy("ADMIN001")
                .build();
        notificationTemplateRepository.save(template);

        PaymentSuccessfulEvent event = new PaymentSuccessfulEvent(
                "STU123",
                "parv@example.com",
                "Parv Agrawal",
                "PAY98765",
                "1500"
        );

        notificationEventPublisher.publish(event);

        verify(emailSender, timeout(5000)).sendEmail(
                eq("parv@example.com"),
                eq("Payment Successful - PAY98765"),
                contains("Dear Parv Agrawal, your payment of INR 1500 for ID PAY98765 was received.")
        );
    }

    @Test
    @DisplayName("2. StudentRegisteredEvent published triggers email notification")
    void studentRegisteredEventTriggersEmail() {
        NotificationTemplate template = NotificationTemplate.builder()
                .name("Registration Welcome")
                .channel(NotificationChannel.EMAIL)
                .type(NotificationType.REGISTRATION_SUCCESS)
                .subject("Welcome to CBP {{studentName}}")
                .content("Hello {{studentName}}, your registration ID is {{registrationId}}.")
                .createdBy("ADMIN001")
                .build();
        notificationTemplateRepository.save(template);

        StudentRegisteredEvent event = new StudentRegisteredEvent(
                "STU123",
                "parv@example.com",
                "Parv Agrawal",
                "REG555"
        );

        notificationEventPublisher.publish(event);

        verify(emailSender, timeout(5000)).sendEmail(
                eq("parv@example.com"),
                eq("Welcome to CBP Parv Agrawal"),
                contains("Hello Parv Agrawal, your registration ID is REG555.")
        );
    }

    @Test
    @DisplayName("3. CertificateGeneratedEvent published triggers email notification")
    void certificateGeneratedEventTriggersEmail() {
        NotificationTemplate template = NotificationTemplate.builder()
                .name("Certificate Ready")
                .channel(NotificationChannel.EMAIL)
                .type(NotificationType.CERTIFICATE_READY)
                .subject("Certificate Issued")
                .content("Dear {{studentName}}, your certificate is available at {{certificateUrl}}.")
                .createdBy("ADMIN001")
                .build();
        notificationTemplateRepository.save(template);

        CertificateGeneratedEvent event = new CertificateGeneratedEvent(
                "STU123",
                "parv@example.com",
                "Parv Agrawal",
                "https://cbp.com/cert/123"
        );

        notificationEventPublisher.publish(event);

        verify(emailSender, timeout(5000)).sendEmail(
                eq("parv@example.com"),
                eq("Certificate Issued"),
                contains("https://cbp.com/cert/123")
        );
    }

    @Test
    @DisplayName("4. Email failure does not break business flow")
    void emailFailureDoesNotBreakBusinessFlow() {
        NotificationTemplate template = NotificationTemplate.builder()
                .name("Payment Confirmation")
                .channel(NotificationChannel.EMAIL)
                .type(NotificationType.PAYMENT_SUCCESS)
                .subject("Payment Successful")
                .content("Content")
                .createdBy("ADMIN001")
                .build();
        notificationTemplateRepository.save(template);

        doThrow(new RuntimeException("SMTP connection timeout"))
                .when(emailSender).sendEmail(anyString(), anyString(), anyString());

        PaymentSuccessfulEvent event = new PaymentSuccessfulEvent(
                "STU123",
                "parv@example.com",
                "Parv Agrawal",
                "PAY98765",
                "1500"
        );

        assertDoesNotThrow(() -> notificationEventPublisher.publish(event));
    }
}

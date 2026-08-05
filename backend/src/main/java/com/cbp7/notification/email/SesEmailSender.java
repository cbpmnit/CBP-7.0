package com.cbp7.notification.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
@Slf4j
public class SesEmailSender implements EmailSender {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username:noreply@cbp.com}")
    private String fromAddress;

    @Override
    public void sendEmail(String recipient, String subject, String body) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            if (fromAddress != null && !fromAddress.isBlank()) {
                helper.setFrom(fromAddress);
            }
            helper.setTo(recipient);
            helper.setSubject(subject != null ? subject : "");
            helper.setText(body != null ? body : "", true);

            javaMailSender.send(message);
            log.info("Email sent successfully to {}", recipient);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}", recipient, e);
            throw new IllegalStateException("Failed to send email: " + e.getMessage(), e);
        }
    }
}

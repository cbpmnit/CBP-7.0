package com.cbp7.platform.admin.helper;

import com.cbp7.program.certificate.repository.CertificateTemplateRepository;
import com.cbp7.platform.notification.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminOperationsReadinessEvaluator {

    private final CertificateTemplateRepository certificateTemplateRepository;
    private final NotificationTemplateRepository notificationTemplateRepository;

    public boolean isRegistrationOpen(long registeredCount) {
        return registeredCount > 0;
    }

    public boolean isPaymentGatewayActive(long paidCount, long pendingPaymentCount) {
        return paidCount > 0 || pendingPaymentCount > 0;
    }

    public boolean isSessionsConfigured(long sessionsConfiguredCount) {
        return sessionsConfiguredCount > 0;
    }

    public boolean isAttendanceSystemReady(long sessionsConfiguredCount) {
        return sessionsConfiguredCount > 0;
    }

    public boolean isCertificateTemplatePublished() {
        return certificateTemplateRepository.findFirstByStatusOrderByUpdatedAtDesc("PUBLISHED").isPresent();
    }

    public boolean isEmailTemplatesReady() {
        return notificationTemplateRepository.count() > 0;
    }
}

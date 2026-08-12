package com.cbp7.platform.notification.events;

import com.cbp7.program.attendance.qr.events.AttendanceQrGeneratedEvent;
import com.cbp7.platform.notification.constant.NotificationVariableConstants;
import com.cbp7.platform.notification.entity.NotificationType;
import com.cbp7.platform.notification.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final EmailNotificationService emailNotificationService;

    @Async("notificationAsyncExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleStudentRegistered(StudentRegisteredEvent event) {
        log.info("Received StudentRegisteredEvent for studentId: {}", event.studentId());
        try {
            Map<String, String> variables = new HashMap<>();
            variables.put(NotificationVariableConstants.STUDENT_ID, event.studentId() != null ? event.studentId() : "");
            variables.put(NotificationVariableConstants.STUDENT_NAME, event.studentName() != null ? event.studentName() : "");
            variables.put(NotificationVariableConstants.REGISTRATION_ID, event.registrationId() != null ? event.registrationId() : "");
            variables.put(NotificationVariableConstants.STUDENT_EMAIL, event.studentEmail() != null ? event.studentEmail() : "");

            emailNotificationService.sendEventEmail(
                    "REGISTRATION_SUCCESS",
                    event.studentEmail(),
                    variables
            );
        } catch (Exception e) {
            log.error("Failed to process registration confirmation email for studentId: {}", event.studentId(), e);
        }
    }

    @Async("notificationAsyncExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handlePaymentSuccessful(PaymentSuccessfulEvent event) {
        log.info("Received PaymentSuccessfulEvent for paymentId: {}", event.paymentId());
        try {
            Map<String, String> variables = new HashMap<>();
            variables.put(NotificationVariableConstants.STUDENT_ID, event.studentId() != null ? event.studentId() : "");
            variables.put(NotificationVariableConstants.STUDENT_NAME, event.studentName() != null ? event.studentName() : "");
            variables.put(NotificationVariableConstants.PAYMENT_ID, event.paymentId() != null ? event.paymentId() : "");
            variables.put(NotificationVariableConstants.AMOUNT, event.amount() != null ? event.amount() : "");
            variables.put(NotificationVariableConstants.STUDENT_EMAIL, event.studentEmail() != null ? event.studentEmail() : "");

            emailNotificationService.sendEventEmail(
                    "PAYMENT_SUCCESS",
                    event.studentEmail(),
                    variables
            );
        } catch (Exception e) {
            log.error("Failed to process payment success email for paymentId: {}", event.paymentId(), e);
        }
    }

    @Async("notificationAsyncExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handlePaymentFailed(PaymentFailedEvent event) {
        log.info("Received PaymentFailedEvent for paymentId: {}", event.paymentId());
        try {
            Map<String, String> variables = new HashMap<>();
            variables.put(NotificationVariableConstants.STUDENT_ID, event.studentId() != null ? event.studentId() : "");
            variables.put(NotificationVariableConstants.STUDENT_NAME, event.studentName() != null ? event.studentName() : "");
            variables.put(NotificationVariableConstants.PAYMENT_ID, event.paymentId() != null ? event.paymentId() : "");
            variables.put(NotificationVariableConstants.AMOUNT, event.amount() != null ? event.amount() : "");
            variables.put(NotificationVariableConstants.STUDENT_EMAIL, event.studentEmail() != null ? event.studentEmail() : "");

            emailNotificationService.sendEventEmail(
                    "PAYMENT_FAILED",
                    event.studentEmail(),
                    variables
            );
        } catch (Exception e) {
            log.error("Failed to process payment failure email for paymentId: {}", event.paymentId(), e);
        }
    }

    @Async("notificationAsyncExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleCertificateGenerated(CertificateGeneratedEvent event) {
        log.info("Received CertificateGeneratedEvent for studentId: {}", event.studentId());
        try {
            Map<String, String> variables = new HashMap<>();
            variables.put(NotificationVariableConstants.STUDENT_ID, event.studentId() != null ? event.studentId() : "");
            variables.put(NotificationVariableConstants.STUDENT_NAME, event.studentName() != null ? event.studentName() : "");
            variables.put(NotificationVariableConstants.CERTIFICATE_URL, event.certificateUrl() != null ? event.certificateUrl() : "");
            variables.put(NotificationVariableConstants.STUDENT_EMAIL, event.studentEmail() != null ? event.studentEmail() : "");

            emailNotificationService.sendEventEmail(
                    "CERTIFICATE_ISSUED",
                    event.studentEmail(),
                    variables
            );
        } catch (Exception e) {
            log.error("Failed to process certificate email for studentId: {}", event.studentId(), e);
        }
    }

    @Async("notificationAsyncExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleAttendanceQrGenerated(AttendanceQrGeneratedEvent event) {
        log.info("Received AttendanceQrGeneratedEvent for studentId: {}", event.studentId());
        try {
            Map<String, String> variables = new HashMap<>();
            variables.put(NotificationVariableConstants.STUDENT_ID, event.studentId() != null ? event.studentId() : "");
            variables.put(NotificationVariableConstants.STUDENT_NAME, event.studentName() != null ? event.studentName() : "");
            variables.put(NotificationVariableConstants.STUDENT_EMAIL, event.studentEmail() != null ? event.studentEmail() : "");
            variables.put(NotificationVariableConstants.QR_TOKEN, event.qrToken() != null ? event.qrToken() : "");

            emailNotificationService.sendEventEmail(
                    "ATTENDANCE_QR_GENERATED",
                    event.studentEmail(),
                    variables
            );
        } catch (Exception e) {
            log.error("Failed to process attendance QR email for studentId: {}", event.studentId(), e);
        }
    }
}

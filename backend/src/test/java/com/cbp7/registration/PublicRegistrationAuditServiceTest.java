package com.cbp7.registration;

import com.cbp7.registration.entity.PublicRegistrationAuditLog;
import com.cbp7.registration.enums.PublicRegistrationAuditEventType;
import com.cbp7.registration.repository.PublicRegistrationAuditLogRepository;
import com.cbp7.registration.service.impl.PublicRegistrationAuditServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PublicRegistrationAuditServiceTest {

    @Mock
    private PublicRegistrationAuditLogRepository auditLogRepository;

    @InjectMocks
    private PublicRegistrationAuditServiceImpl auditService;

    @Test
    void logEvent_SavesAuditLogSuccessfully() {
        UUID regId = UUID.randomUUID();
        UUID txId = UUID.randomUUID();
        String merchantOrderId = "PUB_ORD_TEST123";

        auditService.logEvent(regId, txId, merchantOrderId, PublicRegistrationAuditEventType.PAYMENT_SUCCESS, "Payment verified successfully");

        verify(auditLogRepository).save(any(PublicRegistrationAuditLog.class));
    }

    @Test
    void logEvent_DatabaseException_HandledSafelyWithoutThrowing() {
        UUID regId = UUID.randomUUID();
        doThrow(new RuntimeException("Database error")).when(auditLogRepository).save(any(PublicRegistrationAuditLog.class));

        // Should not throw exception
        auditService.logEvent(regId, null, "PUB_ORD_TEST123", PublicRegistrationAuditEventType.PAYMENT_ERROR, "Payment error");

        verify(auditLogRepository).save(any(PublicRegistrationAuditLog.class));
    }
}

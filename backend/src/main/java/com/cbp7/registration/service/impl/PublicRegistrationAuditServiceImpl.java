package com.cbp7.registration.service.impl;

import com.cbp7.registration.entity.PublicRegistrationAuditLog;
import com.cbp7.registration.enums.PublicRegistrationAuditEventType;
import com.cbp7.registration.repository.PublicRegistrationAuditLogRepository;
import com.cbp7.registration.service.PublicRegistrationAuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublicRegistrationAuditServiceImpl implements PublicRegistrationAuditService {

    private final PublicRegistrationAuditLogRepository auditLogRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logEvent(UUID registrationId, UUID paymentTransactionId, String merchantOrderId, PublicRegistrationAuditEventType eventType, String message) {
        try {
            PublicRegistrationAuditLog logEntry = PublicRegistrationAuditLog.builder()
                    .registrationId(registrationId)
                    .paymentTransactionId(paymentTransactionId)
                    .merchantOrderId(merchantOrderId)
                    .eventType(eventType)
                    .message(message)
                    .build();

            auditLogRepository.save(logEntry);
            log.info("[PUBLIC_REGISTRATION] {} merchantOrderId={} registrationId={}: {}",
                    eventType, merchantOrderId, registrationId, message);
        } catch (Exception e) {
            log.error("[PUBLIC_REGISTRATION] Failed to save audit log event {}: {}", eventType, e.getMessage(), e);
        }
    }
}

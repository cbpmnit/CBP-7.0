package com.cbp7.registration.service;

import com.cbp7.registration.enums.PublicRegistrationAuditEventType;

import java.util.UUID;

public interface PublicRegistrationAuditService {
    void logEvent(UUID registrationId, UUID paymentTransactionId, String merchantOrderId, PublicRegistrationAuditEventType eventType, String message);
}

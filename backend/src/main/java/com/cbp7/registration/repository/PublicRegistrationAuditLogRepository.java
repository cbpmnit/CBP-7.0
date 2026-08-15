package com.cbp7.registration.repository;

import com.cbp7.registration.entity.PublicRegistrationAuditLog;
import com.cbp7.registration.enums.PublicRegistrationAuditEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PublicRegistrationAuditLogRepository extends JpaRepository<PublicRegistrationAuditLog, UUID> {
    List<PublicRegistrationAuditLog> findByRegistrationIdOrderByCreatedAtAsc(UUID registrationId);
    List<PublicRegistrationAuditLog> findByMerchantOrderIdOrderByCreatedAtAsc(String merchantOrderId);
    List<PublicRegistrationAuditLog> findByEventType(PublicRegistrationAuditEventType eventType);
}

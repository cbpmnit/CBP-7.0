package com.cbp7.platform.notification.repository;

import com.cbp7.platform.notification.entity.EmailLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EmailLogRepository extends JpaRepository<EmailLog, UUID> {
    Page<EmailLog> findAllByOrderBySentAtDesc(Pageable pageable);
    List<EmailLog> findByOperationId(UUID operationId);
    List<EmailLog> findByStatus(String status);
    long countByStatus(String status);
}

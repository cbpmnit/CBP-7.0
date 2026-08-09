package com.cbp7.notification.repository;

import com.cbp7.notification.entity.EmailLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, UUID> {
    Page<EmailLog> findAllByOrderBySentAtDesc(Pageable pageable);
    List<EmailLog> findByOperationId(UUID operationId);
    List<EmailLog> findByStatus(String status);
}

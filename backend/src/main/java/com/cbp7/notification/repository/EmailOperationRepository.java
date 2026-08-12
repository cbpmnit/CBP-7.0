package com.cbp7.notification.repository;

import com.cbp7.notification.entity.EmailOperation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EmailOperationRepository extends JpaRepository<EmailOperation, UUID> {
    List<EmailOperation> findByStatus(String status);
    List<EmailOperation> findAllByOrderByCreatedAtDesc();
}

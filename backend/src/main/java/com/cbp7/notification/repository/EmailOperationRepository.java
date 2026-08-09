package com.cbp7.notification.repository;

import com.cbp7.notification.entity.EmailOperation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmailOperationRepository extends JpaRepository<EmailOperation, UUID> {
    List<EmailOperation> findByStatus(String status);
    List<EmailOperation> findAllByOrderByCreatedAtDesc();
}

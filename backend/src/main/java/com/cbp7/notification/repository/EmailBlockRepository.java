package com.cbp7.notification.repository;

import com.cbp7.notification.entity.EmailBlock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EmailBlockRepository extends JpaRepository<EmailBlock, UUID> {
    List<EmailBlock> findByEnabledTrue();
    List<EmailBlock> findByCategory(String category);
}

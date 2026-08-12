package com.cbp7.platform.admin.student.repository;

import com.cbp7.platform.admin.student.entity.AdminPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface AdminPreferencesRepository extends JpaRepository<AdminPreferences, UUID> {
    Optional<AdminPreferences> findByAdminId(String adminId);
}

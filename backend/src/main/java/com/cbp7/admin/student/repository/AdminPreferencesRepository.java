package com.cbp7.admin.student.repository;

import com.cbp7.admin.student.entity.AdminPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminPreferencesRepository extends JpaRepository<AdminPreferences, UUID> {
    Optional<AdminPreferences> findByAdminId(String adminId);
}

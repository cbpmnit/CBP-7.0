package com.cbp7.identity.profile.repository;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.profile.entity.ProfileCompletion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProfileCompletionRepository extends JpaRepository<ProfileCompletion, UUID> {
    Optional<ProfileCompletion> findByUser(User user);
    Optional<ProfileCompletion> findByUserId(UUID userId);
    Optional<ProfileCompletion> findByUserStudentIdIgnoreCase(String studentId);
}

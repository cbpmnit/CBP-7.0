package com.cbp7.profile.repository;

import com.cbp7.auth.entity.User;
import com.cbp7.profile.entity.ProfileCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileCompletionRepository extends JpaRepository<ProfileCompletion, UUID> {
    Optional<ProfileCompletion> findByUser(User user);
    Optional<ProfileCompletion> findByUserId(UUID userId);
    Optional<ProfileCompletion> findByUserStudentIdIgnoreCase(String studentId);
}

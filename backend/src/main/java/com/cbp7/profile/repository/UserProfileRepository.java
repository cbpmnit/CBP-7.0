package com.cbp7.profile.repository;

import com.cbp7.auth.entity.User;
import com.cbp7.profile.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;


public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
    Optional<UserProfile> findByUser(User user);
    Optional<UserProfile> findByUserId(UUID userId);
    Optional<UserProfile> findByUserStudentIdIgnoreCase(String studentId);
    boolean existsByUser(User user);
    boolean existsByUserId(UUID userId);
    boolean existsByUserStudentIdIgnoreCase(String studentId);
}

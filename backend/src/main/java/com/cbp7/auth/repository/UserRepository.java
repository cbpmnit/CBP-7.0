package com.cbp7.auth.repository;

import com.cbp7.auth.entity.User;
import com.cbp7.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByStudentId(String studentId);
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByStudentId(String studentId);
    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
    long countByRole(Role role);
}

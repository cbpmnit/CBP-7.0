package com.cbp7.attendance.qr.repository;

import com.cbp7.attendance.qr.entity.AttendanceQrCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceQrRepository extends JpaRepository<AttendanceQrCode, UUID> {
    Optional<AttendanceQrCode> findByStudentId(String studentId);
    Optional<AttendanceQrCode> findByStudentIdAndActiveTrue(String studentId);
    Optional<AttendanceQrCode> findByToken(String token);
    boolean existsByStudentId(String studentId);
    boolean existsByToken(String token);
}

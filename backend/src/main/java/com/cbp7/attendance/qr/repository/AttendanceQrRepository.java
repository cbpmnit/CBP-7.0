package com.cbp7.attendance.qr.repository;

import com.cbp7.attendance.qr.entity.AttendanceQrCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceQrRepository extends JpaRepository<AttendanceQrCode, UUID> {
    Optional<AttendanceQrCode> findBySessionId(UUID sessionId);
    Optional<AttendanceQrCode> findBySessionIdAndActiveTrue(UUID sessionId);
    Optional<AttendanceQrCode> findBySessionIdAndStudentIdAndActiveTrue(UUID sessionId, String studentId);
    List<AttendanceQrCode> findBySessionIdAndStudentId(UUID sessionId, String studentId);
    Optional<AttendanceQrCode> findFirstBySessionIdAndStudentIdIgnoreCaseAndActiveTrueOrderByCreatedAtDesc(UUID sessionId, String studentId);
    List<AttendanceQrCode> findBySessionIdAndStudentIdIgnoreCase(UUID sessionId, String studentId);
    long countBySessionIdAndStudentIdIgnoreCase(UUID sessionId, String studentId);
    Optional<AttendanceQrCode> findByToken(String token);
    Optional<AttendanceQrCode> findByTokenAndActiveTrue(String token);
    boolean existsByToken(String token);
    List<AttendanceQrCode> findAllBySessionId(UUID sessionId);
    long countBySessionIdAndActiveTrue(UUID sessionId);
}

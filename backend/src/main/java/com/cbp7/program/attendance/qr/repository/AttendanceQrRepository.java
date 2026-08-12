package com.cbp7.program.attendance.qr.repository;

import com.cbp7.program.attendance.qr.entity.AttendanceQrCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface AttendanceQrRepository extends JpaRepository<AttendanceQrCode, UUID> {
    Optional<AttendanceQrCode> findBySessionId(UUID sessionId);
    List<AttendanceQrCode> findBySessionIdAndActiveTrue(UUID sessionId);
    Optional<AttendanceQrCode> findBySessionIdAndStudentIdAndActiveTrue(UUID sessionId, String studentId);
    List<AttendanceQrCode> findBySessionIdAndStudentId(UUID sessionId, String studentId);
    Optional<AttendanceQrCode> findFirstBySessionIdAndStudentIdIgnoreCaseAndActiveTrueOrderByCreatedAtDesc(UUID sessionId, String studentId);
    List<AttendanceQrCode> findBySessionIdAndStudentIdIgnoreCase(UUID sessionId, String studentId);
    long countBySessionIdAndStudentIdIgnoreCase(UUID sessionId, String studentId);
    Optional<AttendanceQrCode> findByToken(String token);
    Optional<AttendanceQrCode> findByTokenAndActiveTrue(String token);
    boolean existsByToken(String token);
    boolean existsBySessionIdAndStudentIdIgnoreCaseAndActiveTrue(UUID sessionId, String studentId);
    List<AttendanceQrCode> findAllBySessionId(UUID sessionId);
    long countBySessionIdAndActiveTrue(UUID sessionId);

    @Query("SELECT LOWER(q.studentId) FROM AttendanceQrCode q WHERE q.sessionId = :sessionId AND q.active = true")
    Set<String> findActiveStudentIdsForSession(@Param("sessionId") UUID sessionId);
}

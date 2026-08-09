package com.cbp7.attendance.record.repository;

import com.cbp7.attendance.record.entity.AttendanceRecord;
import com.cbp7.attendance.record.entity.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {
    Optional<AttendanceRecord> findBySessionIdAndStudentId(UUID sessionId, String studentId);
    boolean existsBySessionIdAndStudentId(UUID sessionId, String studentId);
    List<AttendanceRecord> findBySessionId(UUID sessionId);
    List<AttendanceRecord> findByStudentId(String studentId);
    long countBySessionId(UUID sessionId);
    long countBySessionIdAndStatus(UUID sessionId, AttendanceStatus status);
    long countByStudentIdAndStatus(String studentId, AttendanceStatus status);
    long countByStudentId(String studentId);
    List<AttendanceRecord> findTop50ByMarkedByOrderByMarkedAtDesc(String markedBy);

    Page<AttendanceRecord> findBySessionId(UUID sessionId, Pageable pageable);
    Page<AttendanceRecord> findBySessionIdAndStatus(UUID sessionId, AttendanceStatus status, Pageable pageable);
    Page<AttendanceRecord> findBySessionIdAndStudentIdContainingIgnoreCase(UUID sessionId, String studentId, Pageable pageable);
    Page<AttendanceRecord> findBySessionIdAndStudentIdContainingIgnoreCaseAndStatus(UUID sessionId, String studentId, AttendanceStatus status, Pageable pageable);
}

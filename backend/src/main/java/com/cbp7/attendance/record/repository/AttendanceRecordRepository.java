package com.cbp7.attendance.record.repository;

import com.cbp7.attendance.record.entity.AttendanceRecord;
import com.cbp7.attendance.record.entity.AttendanceStatus;
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
    long countByStudentIdAndStatus(String studentId, AttendanceStatus status);
}

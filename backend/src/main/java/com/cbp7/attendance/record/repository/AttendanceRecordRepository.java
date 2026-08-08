package com.cbp7.attendance.record.repository;

import com.cbp7.attendance.record.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {
    Optional<AttendanceRecord> findByStudentIdAndAttendanceDate(String studentId, LocalDate attendanceDate);
    boolean existsByStudentIdAndAttendanceDate(String studentId, LocalDate attendanceDate);
    List<AttendanceRecord> findByAttendanceDate(LocalDate attendanceDate);
    List<AttendanceRecord> findByStudentId(String studentId);
}

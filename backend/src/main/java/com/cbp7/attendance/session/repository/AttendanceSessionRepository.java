package com.cbp7.attendance.session.repository;

import com.cbp7.attendance.session.entity.AttendanceSession;
import com.cbp7.attendance.session.entity.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, UUID> {
    List<AttendanceSession> findByStatus(SessionStatus status);
    Optional<AttendanceSession> findByDayNumber(Integer dayNumber);
    List<AttendanceSession> findBySessionDate(LocalDate sessionDate);
    List<AttendanceSession> findByVisibilityTrue();
    List<AttendanceSession> findByVisibilityTrueOrderByDayNumberAsc();
    List<AttendanceSession> findAllByOrderByDayNumberAsc();
}

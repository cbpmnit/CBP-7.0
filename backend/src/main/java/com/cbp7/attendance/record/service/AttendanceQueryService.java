package com.cbp7.attendance.record.service;

import com.cbp7.attendance.record.dto.AdminAttendanceSummaryResponse;
import com.cbp7.attendance.record.dto.AttendanceRecordResponse;
import com.cbp7.attendance.record.dto.DailyAttendanceReportResponse;
import com.cbp7.attendance.record.dto.SessionAttendanceStatusDto;
import com.cbp7.attendance.record.dto.StudentAttendanceSummaryResponse;
import com.cbp7.attendance.record.entity.AttendanceRecord;
import com.cbp7.attendance.record.entity.AttendanceStatus;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.attendance.session.entity.AttendanceSession;
import com.cbp7.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceQueryService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DailyAttendanceReportResponse getAttendanceByDate(LocalDate date) {
        if (date == null) {
            throw new IllegalArgumentException("Date must not be null");
        }

        List<AttendanceSession> sessionsOnDate = sessionRepository.findBySessionDate(date);
        List<AttendanceRecordResponse> records = new ArrayList<>();

        for (AttendanceSession session : sessionsOnDate) {
            List<AttendanceRecord> sessionRecords = attendanceRecordRepository.findBySessionId(session.getId());
            records.addAll(sessionRecords.stream().map(AttendanceRecordResponse::fromEntity).toList());
        }

        long totalPresent = records.stream()
                .filter(r -> r.status() == AttendanceStatus.PRESENT)
                .count();

        return new DailyAttendanceReportResponse(date, totalPresent, records);
    }

    @Transactional(readOnly = true)
    public StudentAttendanceSummaryResponse getStudentAttendanceSummary(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("Student ID must not be empty");
        }

        String cleanStudentId = studentId.trim().toLowerCase();
        List<AttendanceSession> allSessions = sessionRepository.findAll();
        List<SessionAttendanceStatusDto> sessionStatusDtos = new ArrayList<>();

        long attendedCount = 0;

        for (AttendanceSession session : allSessions) {
            Optional<AttendanceRecord> recordOpt = attendanceRecordRepository.findBySessionIdAndStudentId(session.getId(), cleanStudentId);
            AttendanceStatus status = recordOpt.map(AttendanceRecord::getStatus).orElse(AttendanceStatus.ABSENT);
            if (status == AttendanceStatus.PRESENT) {
                attendedCount++;
            }

            sessionStatusDtos.add(new SessionAttendanceStatusDto(
                    session.getId(),
                    session.getDayNumber(),
                    session.getTitle(),
                    session.getSessionDate(),
                    status,
                    recordOpt.map(AttendanceRecord::getMarkedAt).orElse(null)
            ));
        }

        long totalSessions = allSessions.size();
        double rawPercentage = totalSessions > 0 ? ((double) attendedCount / totalSessions) * 100.0 : 0.0;
        double percentage = roundToTwoDecimals(rawPercentage);

        return new StudentAttendanceSummaryResponse(
                cleanStudentId,
                totalSessions,
                attendedCount,
                percentage,
                sessionStatusDtos
        );
    }

    @Transactional(readOnly = true)
    public AdminAttendanceSummaryResponse getAdminAttendanceSummary() {
        long totalRegisteredStudents = userRepository.countByRole(Role.ROLE_STUDENT);
        if (totalRegisteredStudents == 0) {
            totalRegisteredStudents = userRepository.count();
        }

        long totalSessions = sessionRepository.count();
        long totalPresentRecords = attendanceRecordRepository.findAll().stream()
                .filter(r -> r.getStatus() == AttendanceStatus.PRESENT)
                .count();

        long maxPossibleAttendance = totalRegisteredStudents * Math.max(totalSessions, 1);
        double rawPercentage = maxPossibleAttendance > 0
                ? ((double) totalPresentRecords / maxPossibleAttendance) * 100.0
                : 0.0;
        double percentage = roundToTwoDecimals(rawPercentage);

        return new AdminAttendanceSummaryResponse(
                totalRegisteredStudents,
                totalPresentRecords,
                percentage
        );
    }

    private double roundToTwoDecimals(double value) {
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}

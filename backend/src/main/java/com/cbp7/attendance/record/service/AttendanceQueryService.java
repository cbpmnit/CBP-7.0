package com.cbp7.attendance.record.service;

import com.cbp7.attendance.record.dto.AdminAttendanceSummaryResponse;
import com.cbp7.attendance.record.dto.AttendanceRecordResponse;
import com.cbp7.attendance.record.dto.DailyAttendanceReportResponse;
import com.cbp7.attendance.record.dto.StudentAttendanceSummaryResponse;
import com.cbp7.attendance.record.entity.AttendanceRecord;
import com.cbp7.attendance.record.entity.AttendanceStatus;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceQueryService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DailyAttendanceReportResponse getAttendanceByDate(LocalDate date) {
        if (date == null) {
            throw new IllegalArgumentException("Date must not be null");
        }

        List<AttendanceRecord> records = attendanceRecordRepository.findByAttendanceDate(date);
        long totalPresent = records.stream()
                .filter(r -> r.getStatus() == AttendanceStatus.PRESENT)
                .count();

        List<AttendanceRecordResponse> responseList = records.stream()
                .map(AttendanceRecordResponse::fromEntity)
                .toList();

        return new DailyAttendanceReportResponse(date, totalPresent, responseList);
    }

    @Transactional(readOnly = true)
    public StudentAttendanceSummaryResponse getStudentAttendanceSummary(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("Student ID must not be empty");
        }

        List<AttendanceRecord> studentRecords = attendanceRecordRepository.findByStudentId(studentId);
        List<AttendanceRecordResponse> responseList = studentRecords.stream()
                .map(AttendanceRecordResponse::fromEntity)
                .toList();

        long presentCount = studentRecords.stream()
                .filter(r -> r.getStatus() == AttendanceStatus.PRESENT)
                .count();

        long totalClasses = Math.max(studentRecords.size(), 1);

        double rawPercentage = ((double) presentCount / totalClasses) * 100.0;
        double percentage = roundToTwoDecimals(rawPercentage);

        return new StudentAttendanceSummaryResponse(
                studentId,
                totalClasses,
                presentCount,
                percentage,
                responseList
        );
    }

    @Transactional(readOnly = true)
    public AdminAttendanceSummaryResponse getAdminAttendanceSummary() {
        long totalRegisteredStudents = userRepository.countByRole(Role.ROLE_STUDENT);
        if (totalRegisteredStudents == 0) {
            totalRegisteredStudents = userRepository.count();
        }

        LocalDate today = LocalDate.now();
        List<AttendanceRecord> todayRecords = attendanceRecordRepository.findByAttendanceDate(today);
        long totalAttendanceToday = todayRecords.stream()
                .filter(r -> r.getStatus() == AttendanceStatus.PRESENT)
                .count();

        double rawPercentage = totalRegisteredStudents > 0
                ? ((double) totalAttendanceToday / totalRegisteredStudents) * 100.0
                : 0.0;
        double percentage = roundToTwoDecimals(rawPercentage);

        return new AdminAttendanceSummaryResponse(
                totalRegisteredStudents,
                totalAttendanceToday,
                percentage
        );
    }

    private double roundToTwoDecimals(double value) {
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}

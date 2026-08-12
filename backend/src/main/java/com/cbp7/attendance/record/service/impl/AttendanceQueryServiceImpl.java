package com.cbp7.attendance.record.service.impl;

import com.cbp7.attendance.record.calculator.AttendanceCalculator;
import com.cbp7.attendance.record.dto.common.*;
import com.cbp7.attendance.record.dto.response.*;
import com.cbp7.attendance.record.entity.AttendanceRecord;
import com.cbp7.attendance.record.entity.AttendanceStatus;
import com.cbp7.attendance.record.helper.AttendanceCsvExporter;
import com.cbp7.attendance.record.helper.AttendanceMarkerResolver;
import com.cbp7.attendance.record.helper.AttendanceProfileAggregator;
import com.cbp7.attendance.record.mapper.AttendanceMapper;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.attendance.record.service.AttendanceQueryService;
import com.cbp7.attendance.session.dto.response.SessionSummaryResponse;
import com.cbp7.attendance.session.entity.AttendanceSession;
import com.cbp7.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceQueryServiceImpl implements AttendanceQueryService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final AttendanceMarkerResolver markerResolver;
    private final AttendanceMapper attendanceMapper;
    private final AttendanceCalculator attendanceCalculator;
    private final AttendanceProfileAggregator profileAggregator;
    private final AttendanceCsvExporter csvExporter;

    @Override
    @Transactional(readOnly = true)
    public SessionSummaryResponse getSessionSummary(UUID sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        long totalRegisteredStudents = determineTotalRegisteredStudents();
        long presentCount = attendanceRecordRepository.countBySessionIdAndStatus(sessionId, AttendanceStatus.PRESENT);
        long absentCount = attendanceCalculator.calculateAbsentCount(totalRegisteredStudents, presentCount);
        double percentage = attendanceCalculator.calculatePercentage(presentCount, totalRegisteredStudents);

        return new SessionSummaryResponse(
                session.getId(),
                session.getDayNumber(),
                session.getTitle(),
                session.getSessionDate(),
                totalRegisteredStudents,
                presentCount,
                absentCount,
                percentage
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StudentSessionRecordDto> getSessionRecordsPaginated(
            UUID sessionId,
            String search,
            AttendanceStatus status,
            Pageable pageable
    ) {
        if (!sessionRepository.existsById(sessionId)) {
            throw new ResourceNotFoundException("Session not found with ID: " + sessionId);
        }

        String cleanSearch = search != null && !search.isBlank() ? search.trim().toLowerCase() : null;
        Page<AttendanceRecord> recordsPage = fetchFilteredRecordsPage(sessionId, cleanSearch, status, pageable);

        List<StudentSessionRecordDto> dtos = recordsPage.getContent().stream()
                .map(this::toStudentSessionRecordDto)
                .toList();

        return new PageImpl<>(dtos, pageable, recordsPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public DailyAttendanceReportResponse getAttendanceByDate(LocalDate date) {
        if (date == null) {
            throw new IllegalArgumentException("Date must not be null");
        }

        List<AttendanceSession> sessionsOnDate = sessionRepository.findBySessionDate(date);
        List<AttendanceRecordResponse> records = new ArrayList<>();

        for (AttendanceSession session : sessionsOnDate) {
            List<AttendanceRecord> sessionRecords = attendanceRecordRepository.findBySessionId(session.getId());
            records.addAll(sessionRecords.stream().map(attendanceMapper::toRecordResponse).toList());
        }

        long totalPresent = records.stream()
                .filter(r -> r.status() == AttendanceStatus.PRESENT)
                .count();

        return new DailyAttendanceReportResponse(date, totalPresent, records);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentAttendanceSummaryResponse getStudentAttendanceSummary(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("Student ID must not be empty");
        }

        String cleanStudentId = studentId.trim().toLowerCase();
        List<AttendanceSession> visibleSessions = sessionRepository.findByVisibilityTrueOrderByDayNumberAsc();
        List<SessionAttendanceStatusDto> sessionStatusDtos = new ArrayList<>();

        long attendedCount = 0;

        for (AttendanceSession session : visibleSessions) {
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

        long totalSessions = visibleSessions.size();
        double percentage = attendanceCalculator.calculatePercentage(attendedCount, totalSessions);

        return new StudentAttendanceSummaryResponse(
                cleanStudentId,
                totalSessions,
                attendedCount,
                percentage,
                sessionStatusDtos
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AdminAttendanceSummaryResponse getAdminAttendanceSummary() {
        long totalRegisteredStudents = determineTotalRegisteredStudents();
        long totalSessions = sessionRepository.count();
        long totalPresentRecords = attendanceRecordRepository.findAll().stream()
                .filter(r -> r.getStatus() == AttendanceStatus.PRESENT)
                .count();

        long maxPossibleAttendance = totalRegisteredStudents * Math.max(totalSessions, 1);
        double percentage = attendanceCalculator.calculatePercentage(totalPresentRecords, maxPossibleAttendance);

        return new AdminAttendanceSummaryResponse(
                totalRegisteredStudents,
                totalPresentRecords,
                percentage
        );
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportAttendanceCsv(String search, UUID sessionId, LocalDate date) {
        List<AttendanceRecord> records = attendanceRecordRepository.findAll();
        List<AttendanceSession> sessions = sessionRepository.findAll();
        Map<UUID, AttendanceSession> sessionMap = new HashMap<>();
        for (AttendanceSession s : sessions) {
            sessionMap.put(s.getId(), s);
        }

        List<User> allUsers = userRepository.findAll();
        Map<String, String> userNameMap = new HashMap<>();
        for (User u : allUsers) {
            if (u.getStudentId() != null) {
                userNameMap.put(u.getStudentId().toLowerCase(), u.getName() != null ? u.getName() : "Student");
            }
        }

        return csvExporter.exportAttendanceCsv(records, sessionMap, userNameMap, search, sessionId, date);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentAttendanceProfileResponse getStudentAttendanceProfile(String studentId) {
        return profileAggregator.buildStudentAttendanceProfile(studentId);
    }

    @Override
    @Transactional(readOnly = true)
    public UserAttendanceProfileResponse getUserAttendanceProfile(String userId) {
        return profileAggregator.buildUserAttendanceProfile(userId);
    }

    // --- Private Story Helper Methods ---

    private long determineTotalRegisteredStudents() {
        long count = userRepository.countByRole(Role.ROLE_STUDENT);
        return count > 0 ? count : userRepository.count();
    }

    private Page<AttendanceRecord> fetchFilteredRecordsPage(
            UUID sessionId, String cleanSearch, AttendanceStatus status, Pageable pageable
    ) {
        if (cleanSearch != null && status != null) {
            return attendanceRecordRepository.findBySessionIdAndStudentIdContainingIgnoreCaseAndStatus(sessionId, cleanSearch, status, pageable);
        }
        if (cleanSearch != null) {
            return attendanceRecordRepository.findBySessionIdAndStudentIdContainingIgnoreCase(sessionId, cleanSearch, pageable);
        }
        if (status != null) {
            return attendanceRecordRepository.findBySessionIdAndStatus(sessionId, status, pageable);
        }
        return attendanceRecordRepository.findBySessionId(sessionId, pageable);
    }

    private StudentSessionRecordDto toStudentSessionRecordDto(AttendanceRecord r) {
        String name = "";
        String email = "";
        String userIdStr = "";

        Optional<User> userOpt = userRepository.findByStudentId(r.getStudentId());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            name = user.getName() != null ? user.getName() : "";
            email = user.getEmail() != null ? user.getEmail() : "";
            userIdStr = user.getId() != null ? user.getId().toString() : "";
        }

        StudentInfo studentInfo = new StudentInfo(userIdStr, name, r.getStudentId(), email);
        MarkedByInfo markerDetail = markerResolver.resolveMarker(r.getMarkedBy());

        return new StudentSessionRecordDto(
                r.getStudentId(),
                name,
                email,
                r.getStatus(),
                r.getMarkedAt(),
                markerDetail.name(),
                studentInfo,
                markerDetail
        );
    }
}

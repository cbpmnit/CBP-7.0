package com.cbp7.attendance.record.service.impl;

import com.cbp7.attendance.record.dto.common.*;
import com.cbp7.attendance.record.dto.response.*;
import com.cbp7.attendance.record.entity.AttendanceRecord;
import com.cbp7.attendance.record.entity.AttendanceStatus;
import com.cbp7.attendance.record.helper.AttendanceMarkerResolver;
import com.cbp7.attendance.record.mapper.AttendanceMapper;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.attendance.record.service.AttendanceQueryService;
import com.cbp7.attendance.session.dto.response.SessionSummaryResponse;
import com.cbp7.attendance.session.entity.AttendanceSession;
import com.cbp7.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.certificate.repository.CertificateRepository;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.common.util.CsvExportUtil;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceQueryServiceImpl implements AttendanceQueryService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final PaymentRepository paymentRepository;
    private final CertificateRepository certificateRepository;
    private final AttendanceMarkerResolver markerResolver;
    private final AttendanceMapper attendanceMapper;

    @Override
    @Transactional(readOnly = true)
    public SessionSummaryResponse getSessionSummary(UUID sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        long totalRegisteredStudents = userRepository.countByRole(Role.ROLE_STUDENT);
        if (totalRegisteredStudents == 0) {
            totalRegisteredStudents = userRepository.count();
        }

        long presentCount = attendanceRecordRepository.countBySessionIdAndStatus(sessionId, AttendanceStatus.PRESENT);
        long absentCount = Math.max(0, totalRegisteredStudents - presentCount);

        double rawPercentage = totalRegisteredStudents > 0
                ? ((double) presentCount / totalRegisteredStudents) * 100.0
                : 0.0;
        double percentage = roundToTwoDecimals(rawPercentage);

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

        Page<AttendanceRecord> recordsPage;
        String cleanSearch = search != null && !search.isBlank() ? search.trim().toLowerCase() : null;

        if (cleanSearch != null && status != null) {
            recordsPage = attendanceRecordRepository.findBySessionIdAndStudentIdContainingIgnoreCaseAndStatus(sessionId, cleanSearch, status, pageable);
        } else if (cleanSearch != null) {
            recordsPage = attendanceRecordRepository.findBySessionIdAndStudentIdContainingIgnoreCase(sessionId, cleanSearch, pageable);
        } else if (status != null) {
            recordsPage = attendanceRecordRepository.findBySessionIdAndStatus(sessionId, status, pageable);
        } else {
            recordsPage = attendanceRecordRepository.findBySessionId(sessionId, pageable);
        }

        List<StudentSessionRecordDto> dtos = recordsPage.getContent().stream()
                .map(r -> {
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
                    MarkedByInfo markerDetail = resolveMarkedByInfo(r.getMarkedBy());

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
                })
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

    @Override
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

    @Override
    @Transactional(readOnly = true)
    public byte[] exportAttendanceCsv(String search, UUID sessionId, LocalDate date) {
        List<AttendanceRecord> records = attendanceRecordRepository.findAll();
        List<AttendanceSession> sessions = sessionRepository.findAll();
        Map<UUID, AttendanceSession> sessionMap = new HashMap<>();
        for (AttendanceSession s : sessions) sessionMap.put(s.getId(), s);

        List<User> allUsers = userRepository.findAll();
        Map<String, String> userNameMap = new HashMap<>();
        for (User u : allUsers) {
            if (u.getStudentId() != null) {
                userNameMap.put(u.getStudentId().toLowerCase(), u.getName() != null ? u.getName() : "Student");
            }
        }

        String q = search != null ? search.trim().toLowerCase() : "";

        List<String> headers = List.of(
                "Student ID", "Student Name", "Session Title", "Day Number",
                "Session Date", "Attendance Status", "Marked At", "Marked By"
        );

        List<List<String>> rows = new ArrayList<>();
        for (AttendanceRecord r : records) {
            AttendanceSession session = sessionMap.get(r.getSessionId());
            if (sessionId != null && !sessionId.equals(r.getSessionId())) continue;
            if (date != null && (session == null || !date.equals(session.getSessionDate()))) continue;

            String sid = r.getStudentId() != null ? r.getStudentId() : "";
            String sName = userNameMap.getOrDefault(sid.toLowerCase(), sid);

            if (!q.isEmpty()) {
                boolean match = sid.toLowerCase().contains(q) || sName.toLowerCase().contains(q);
                if (!match) continue;
            }

            rows.add(List.of(
                    sid,
                    sName,
                    session != null ? session.getTitle() : "Session",
                    session != null ? String.valueOf(session.getDayNumber()) : "-",
                    session != null && session.getSessionDate() != null ? session.getSessionDate().toString() : "-",
                    r.getStatus() != null ? r.getStatus().name() : "PRESENT",
                    r.getMarkedAt() != null ? r.getMarkedAt().toString() : "-",
                    r.getMarkedBy() != null ? r.getMarkedBy() : "Admin/Scanner"
            ));
        }

        return CsvExportUtil.generateCsv(headers, rows);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentAttendanceProfileResponse getStudentAttendanceProfile(String studentId) {
        String cleanStudentId = studentId != null ? studentId.trim().toLowerCase() : "";

        String name = "";
        String email = "";
        String phoneNumber = "";
        String branch = "N/A";
        Integer year = 1;
        String registrationDate = "N/A";
        UUID userId = null;

        Optional<CbpRegistration> regOpt = cbpRegistrationRepository.findByUserStudentIdIgnoreCase(cleanStudentId);
        if (regOpt.isPresent()) {
            CbpRegistration reg = regOpt.get();
            name = (reg.getFirstName() != null ? reg.getFirstName() : "") + " " + (reg.getLastName() != null ? reg.getLastName() : "");
            email = reg.getEmail();
            phoneNumber = reg.getPhoneNumber();
            branch = reg.getBranch();
            year = reg.getYear();
            registrationDate = reg.getCreatedAt() != null ? reg.getCreatedAt().toString() : "N/A";
            if (reg.getUser() != null) {
                userId = reg.getUser().getId();
            }
        } else {
            Optional<User> userOpt = userRepository.findByStudentId(cleanStudentId);
            if (userOpt.isPresent()) {
                User u = userOpt.get();
                name = u.getName();
                email = u.getEmail();
                phoneNumber = u.getPhoneNumber() != null ? u.getPhoneNumber() : "";
                userId = u.getId();
            }
        }

        String paymentStatus = "PENDING";
        if (userId != null) {
            boolean hasPaid = paymentRepository.existsByUserIdAndPaymentStatus(userId, PaymentStatus.SUCCESS);
            paymentStatus = hasPaid ? "PAID" : "PENDING";
        }

        List<AttendanceSession> visibleSessions = sessionRepository.findByVisibilityTrueOrderByDayNumberAsc();
        long totalSessions = visibleSessions.size();
        long presentCount = attendanceRecordRepository.countByStudentId(cleanStudentId);
        long absentCount = Math.max(0, totalSessions - presentCount);
        double attendancePercentage = totalSessions > 0 ? (presentCount * 100.0 / totalSessions) : 0.0;
        attendancePercentage = roundToTwoDecimals(attendancePercentage);

        String certificateStatus = "LOCKED";
        boolean hasCert = certificateRepository.existsByStudentId(cleanStudentId);
        if (hasCert) {
            certificateStatus = "ISSUED";
        } else if (attendancePercentage >= 75.0 && paymentStatus.equals("PAID")) {
            certificateStatus = "ELIGIBLE";
        }

        List<SessionAttendanceDetailDto> history = new ArrayList<>();
        for (AttendanceSession s : visibleSessions) {
            Optional<AttendanceRecord> recOpt = attendanceRecordRepository.findBySessionIdAndStudentId(s.getId(), cleanStudentId);
            if (recOpt.isPresent()) {
                AttendanceRecord rec = recOpt.get();
                MarkedByInfo marker = resolveMarkedByInfo(rec.getMarkedBy());
                String markerText = marker.name() + " (" + marker.role().replace("ROLE_", "") + ")";
                history.add(new SessionAttendanceDetailDto(
                        s.getDayNumber(),
                        s.getTitle(),
                        "PRESENT",
                        markerText,
                        rec.getMarkedAt() != null ? rec.getMarkedAt().toString() : ""
                ));
            } else {
                history.add(new SessionAttendanceDetailDto(
                        s.getDayNumber(),
                        s.getTitle(),
                        "ABSENT",
                        "-",
                        "-"
                ));
            }
        }

        return new StudentAttendanceProfileResponse(
                name,
                studentId,
                email,
                phoneNumber,
                branch,
                year,
                registrationDate,
                paymentStatus,
                certificateStatus,
                totalSessions,
                presentCount,
                absentCount,
                attendancePercentage,
                history
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserAttendanceProfileResponse getUserAttendanceProfile(String userId) {
        String name = "Unknown User";
        String email = "N/A";
        String roleStr = "VOLUNTEER";
        List<String> permissions = new ArrayList<>();
        List<UserActivityDto> activities = new ArrayList<>();

        Optional<User> userOpt = Optional.empty();
        try {
            UUID userUuid = UUID.fromString(userId);
            userOpt = userRepository.findById(userUuid);
        } catch (IllegalArgumentException e) {
            userOpt = userRepository.findByStudentId(userId);
        }

        if (userOpt.isPresent()) {
            User u = userOpt.get();
            name = u.getName();
            email = u.getEmail();
            roleStr = u.getRole() != null ? u.getRole().name().replace("ROLE_", "") : "VOLUNTEER";
            if (u.getPermissions() != null) {
                permissions.addAll(u.getPermissions());
            }
            if (permissions.isEmpty() && u.getRole() != null) {
                permissions.add("ATTENDANCE_VIEW");
                if (u.getRole() == Role.ROLE_ADMIN) {
                    permissions.add("ATTENDANCE_SCAN");
                    permissions.add("SESSION_EDIT");
                }
            }

            List<AttendanceRecord> records = attendanceRecordRepository.findTop50ByMarkedByOrderByMarkedAtDesc(u.getId().toString());
            for (AttendanceRecord r : records) {
                String studentName = r.getStudentId();
                Optional<User> studOpt = userRepository.findByStudentId(r.getStudentId());
                if (studOpt.isPresent()) {
                    studentName = studOpt.get().getName();
                }

                String sessionTitle = "Session";
                Optional<AttendanceSession> sessOpt = sessionRepository.findById(r.getSessionId());
                if (sessOpt.isPresent()) {
                    sessionTitle = "Day " + sessOpt.get().getDayNumber() + " (" + sessOpt.get().getTitle() + ")";
                }

                String description = "Marked " + studentName + " (" + r.getStudentId() + ") present in " + sessionTitle;
                activities.add(new UserActivityDto(
                        description,
                        r.getMarkedAt() != null ? r.getMarkedAt().toString() : ""
                ));
            }
        } else {
            name = userId;
            roleStr = userId.equalsIgnoreCase("admin") ? "ADMIN" : "SYSTEM";
            permissions.add("ATTENDANCE_VIEW");
            permissions.add("ATTENDANCE_SCAN");
        }

        return new UserAttendanceProfileResponse(
                name,
                email,
                roleStr,
                permissions,
                activities
        );
    }

    // --- Private Helper Methods ---

    private MarkedByInfo resolveMarkedByInfo(String markedBy) {
        if (markedBy == null || markedBy.isBlank()) {
            return new MarkedByInfo("system", "System", "SYSTEM");
        }
        if (markedBy.equalsIgnoreCase("system") || markedBy.equalsIgnoreCase("admin") || markedBy.equalsIgnoreCase("volunteer")) {
            String role = markedBy.equalsIgnoreCase("admin") ? "ROLE_ADMIN" : 
                         markedBy.equalsIgnoreCase("volunteer") ? "ROLE_VOLUNTEER" : "SYSTEM";
            String name = markedBy.equalsIgnoreCase("admin") ? "Admin" : 
                         markedBy.equalsIgnoreCase("volunteer") ? "Volunteer" : "System";
            return new MarkedByInfo(markedBy, name, role);
        }
        try {
            UUID userUuid = UUID.fromString(markedBy);
            return userRepository.findById(userUuid)
                    .map(u -> new MarkedByInfo(u.getId().toString(), u.getName(), u.getRole() != null ? u.getRole().name() : "ROLE_VOLUNTEER"))
                    .orElseGet(() -> new MarkedByInfo(markedBy, "Unknown User", "ROLE_VOLUNTEER"));
        } catch (IllegalArgumentException e) {
            return new MarkedByInfo(markedBy, markedBy, "ROLE_VOLUNTEER");
        }
    }

    private double roundToTwoDecimals(double value) {
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}

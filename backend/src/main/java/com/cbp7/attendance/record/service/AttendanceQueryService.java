package com.cbp7.attendance.record.service;

import com.cbp7.attendance.record.dto.AdminAttendanceSummaryResponse;
import com.cbp7.attendance.record.dto.AttendanceRecordResponse;
import com.cbp7.attendance.record.dto.DailyAttendanceReportResponse;
import com.cbp7.attendance.record.dto.SessionAttendanceStatusDto;
import com.cbp7.attendance.record.dto.StudentAttendanceSummaryResponse;
import com.cbp7.attendance.record.dto.StudentSessionRecordDto;
import com.cbp7.attendance.record.entity.AttendanceRecord;
import com.cbp7.attendance.record.entity.AttendanceStatus;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.attendance.session.dto.SessionSummaryResponse;
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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceQueryService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final com.cbp7.cbp.repository.CbpRegistrationRepository cbpRegistrationRepository;
    private final com.cbp7.payment.repository.PaymentRepository paymentRepository;
    private final com.cbp7.certificate.repository.CertificateRepository certificateRepository;

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

    @Transactional(readOnly = true)
    public Page<StudentSessionRecordDto> getSessionRecordsPaginated(
            UUID sessionId,
            String search,
            AttendanceStatus status,
            Pageable pageable
    ) {
        // Validate session exists
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

                    com.cbp7.attendance.record.dto.StudentInfo studentInfo = new com.cbp7.attendance.record.dto.StudentInfo(
                            userIdStr, name, r.getStudentId(), email
                    );
                    com.cbp7.attendance.record.dto.MarkedByInfo markerDetail = resolveMarkedByInfo(r.getMarkedBy());

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

    private com.cbp7.attendance.record.dto.MarkedByInfo resolveMarkedByInfo(String markedBy) {
        if (markedBy == null || markedBy.isBlank()) {
            return new com.cbp7.attendance.record.dto.MarkedByInfo("system", "System", "SYSTEM");
        }
        if (markedBy.equalsIgnoreCase("system") || markedBy.equalsIgnoreCase("admin") || markedBy.equalsIgnoreCase("volunteer")) {
            String role = markedBy.equalsIgnoreCase("admin") ? "ROLE_ADMIN" : 
                         markedBy.equalsIgnoreCase("volunteer") ? "ROLE_VOLUNTEER" : "SYSTEM";
            String name = markedBy.equalsIgnoreCase("admin") ? "Admin" : 
                         markedBy.equalsIgnoreCase("volunteer") ? "Volunteer" : "System";
            return new com.cbp7.attendance.record.dto.MarkedByInfo(markedBy, name, role);
        }
        try {
            UUID userUuid = UUID.fromString(markedBy);
            return userRepository.findById(userUuid)
                    .map(u -> new com.cbp7.attendance.record.dto.MarkedByInfo(u.getId().toString(), u.getName(), u.getRole() != null ? u.getRole().name() : "ROLE_VOLUNTEER"))
                    .orElseGet(() -> new com.cbp7.attendance.record.dto.MarkedByInfo(markedBy, "Unknown User", "ROLE_VOLUNTEER"));
        } catch (IllegalArgumentException e) {
            return new com.cbp7.attendance.record.dto.MarkedByInfo(markedBy, markedBy, "ROLE_VOLUNTEER");
        }
    }

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

    @Transactional(readOnly = true)
    public byte[] exportAttendanceCsv(String search, UUID sessionId, LocalDate date) {
        List<AttendanceRecord> records = attendanceRecordRepository.findAll();
        List<AttendanceSession> sessions = sessionRepository.findAll();
        java.util.Map<UUID, AttendanceSession> sessionMap = new java.util.HashMap<>();
        for (AttendanceSession s : sessions) sessionMap.put(s.getId(), s);

        List<User> allUsers = userRepository.findAll();
        java.util.Map<String, String> userNameMap = new java.util.HashMap<>();
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

        List<List<String>> rows = new java.util.ArrayList<>();
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

        return com.cbp7.common.util.CsvExportUtil.generateCsv(headers, rows);
    }

    @Transactional(readOnly = true)
    public com.cbp7.attendance.record.dto.StudentAttendanceProfileResponse getStudentAttendanceProfile(String studentId) {
        String cleanStudentId = studentId != null ? studentId.trim().toLowerCase() : "";

        String name = "";
        String email = "";
        String phoneNumber = "";
        String branch = "N/A";
        Integer year = 1;
        String registrationDate = "N/A";
        UUID userId = null;

        Optional<com.cbp7.cbp.entity.CbpRegistration> regOpt = cbpRegistrationRepository.findByUserStudentIdIgnoreCase(cleanStudentId);
        if (regOpt.isPresent()) {
            com.cbp7.cbp.entity.CbpRegistration reg = regOpt.get();
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
            boolean hasPaid = paymentRepository.existsByUserIdAndPaymentStatus(userId, com.cbp7.payment.enums.PaymentStatus.SUCCESS);
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

        List<com.cbp7.attendance.record.dto.SessionAttendanceDetailDto> history = new ArrayList<>();
        for (AttendanceSession s : visibleSessions) {
            Optional<AttendanceRecord> recOpt = attendanceRecordRepository.findBySessionIdAndStudentId(s.getId(), cleanStudentId);
            if (recOpt.isPresent()) {
                AttendanceRecord rec = recOpt.get();
                com.cbp7.attendance.record.dto.MarkedByInfo marker = resolveMarkedByInfo(rec.getMarkedBy());
                String markerText = marker.name() + " (" + marker.role().replace("ROLE_", "") + ")";
                history.add(new com.cbp7.attendance.record.dto.SessionAttendanceDetailDto(
                        s.getDayNumber(),
                        s.getTitle(),
                        "PRESENT",
                        markerText,
                        rec.getMarkedAt() != null ? rec.getMarkedAt().toString() : ""
                ));
            } else {
                history.add(new com.cbp7.attendance.record.dto.SessionAttendanceDetailDto(
                        s.getDayNumber(),
                        s.getTitle(),
                        "ABSENT",
                        "-",
                        "-"
                ));
            }
        }

        return new com.cbp7.attendance.record.dto.StudentAttendanceProfileResponse(
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

    @Transactional(readOnly = true)
    public com.cbp7.attendance.record.dto.UserAttendanceProfileResponse getUserAttendanceProfile(String userId) {
        String name = "Unknown User";
        String email = "N/A";
        String roleStr = "VOLUNTEER";
        List<String> permissions = new ArrayList<>();
        List<com.cbp7.attendance.record.dto.UserActivityDto> activities = new ArrayList<>();

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
                activities.add(new com.cbp7.attendance.record.dto.UserActivityDto(
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

        return new com.cbp7.attendance.record.dto.UserAttendanceProfileResponse(
                name,
                email,
                roleStr,
                permissions,
                activities
        );
    }

    private double roundToTwoDecimals(double value) {
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}

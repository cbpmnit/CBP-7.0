package com.cbp7.program.attendance.record.helper;

import com.cbp7.program.attendance.record.calculator.AttendanceCalculator;
import com.cbp7.program.attendance.record.dto.common.MarkedByInfo;
import com.cbp7.program.attendance.record.dto.common.SessionAttendanceDetailDto;
import com.cbp7.program.attendance.record.dto.common.UserActivityDto;
import com.cbp7.program.attendance.record.dto.response.StudentAttendanceProfileResponse;
import com.cbp7.program.attendance.record.dto.response.UserAttendanceProfileResponse;
import com.cbp7.program.attendance.record.entity.AttendanceRecord;
import com.cbp7.program.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.program.attendance.session.entity.AttendanceSession;
import com.cbp7.program.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.program.registration.repository.CbpRegistrationRepository;
import com.cbp7.program.certificate.repository.CertificateRepository;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AttendanceProfileAggregator {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final PaymentRepository paymentRepository;
    private final CertificateRepository certificateRepository;
    private final AttendanceMarkerResolver markerResolver;
    private final AttendanceCalculator attendanceCalculator;

    public StudentAttendanceProfileResponse buildStudentAttendanceProfile(String studentId) {
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
        long absentCount = attendanceCalculator.calculateAbsentCount(totalSessions, presentCount);
        double attendancePercentage = attendanceCalculator.calculatePercentage(presentCount, totalSessions);

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
                MarkedByInfo marker = markerResolver.resolveMarker(rec.getMarkedBy());
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

    public UserAttendanceProfileResponse buildUserAttendanceProfile(String userId) {
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
}

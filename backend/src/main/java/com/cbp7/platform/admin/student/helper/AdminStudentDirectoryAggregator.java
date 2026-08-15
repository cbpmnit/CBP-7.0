package com.cbp7.platform.admin.student.helper;

import com.cbp7.platform.admin.student.dto.response.AdminStudentListItemResponse;
import com.cbp7.platform.admin.student.AdminStudentMapper;
import com.cbp7.platform.admin.student.resolver.StudentIdentityResolver;
import com.cbp7.platform.admin.student.resolver.StudentPaymentStatusResolver;
import com.cbp7.program.attendance.record.AttendanceCalculator;
import com.cbp7.program.attendance.record.entity.AttendanceStatus;
import com.cbp7.program.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.program.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.program.registration.repository.CbpRegistrationRepository;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.identity.profile.entity.UserProfile;
import com.cbp7.identity.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminStudentDirectoryAggregator {

    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final StudentIdentityResolver identityResolver;
    private final StudentPaymentStatusResolver paymentStatusResolver;
    private final AdminStudentFilter studentFilter;
    private final AdminStudentMapper studentMapper;
    private final AttendanceCalculator attendanceCalculator;

    public Page<AdminStudentListItemResponse> getStudentsPaginated(
            String search,
            String registrationStatus,
            String paymentStatus,
            String attendanceStatus,
            String profileStatus,
            Pageable pageable
    ) {
        log.info("[AdminStudentDirectory] Fetching students with filters: search='{}', registrationStatus='{}', paymentStatus='{}', attendanceStatus='{}', profileStatus='{}', page={}, size={}",
                search, registrationStatus, paymentStatus, attendanceStatus, profileStatus,
                pageable.isPaged() ? pageable.getPageNumber() : 0,
                pageable.isPaged() ? pageable.getPageSize() : "ALL");

        List<User> studentUsers = userRepository.findAll().stream()
                .filter(u -> u.hasRole(Role.ROLE_STUDENT) && !u.hasRole(Role.ROLE_ADMIN) && Boolean.TRUE.equals(u.getEnabled()))
                .toList();

        Map<UUID, UserProfile> profilesByUserId = userProfileRepository.findAll().stream()
                .filter(p -> p.getUser() != null && p.getUser().getId() != null)
                .collect(Collectors.toMap(p -> p.getUser().getId(), p -> p, (a, b) -> a));

        Map<UUID, CbpRegistration> regsByUserId = cbpRegistrationRepository.findAll().stream()
                .filter(r -> r.getUser() != null && r.getUser().getId() != null)
                .collect(Collectors.toMap(r -> r.getUser().getId(), r -> r, (a, b) -> a));

        Map<String, CbpRegistration> regsByStudentId = cbpRegistrationRepository.findAll().stream()
                .filter(r -> r.getStudentId() != null && !r.getStudentId().isBlank())
                .collect(Collectors.toMap(r -> r.getStudentId().toLowerCase().trim(), r -> r, (a, b) -> a));

        Map<UUID, List<Payment>> paymentsByUserId = paymentRepository.findAll().stream()
                .filter(p -> p.getUserId() != null)
                .collect(Collectors.groupingBy(Payment::getUserId));

        Map<UUID, List<Payment>> paymentsByRegId = paymentRepository.findAll().stream()
                .filter(p -> p.getRegistrationId() != null)
                .collect(Collectors.groupingBy(Payment::getRegistrationId));

        long totalSessions = sessionRepository.count();

        Set<UUID> processedUserIds = new HashSet<>();
        Set<String> processedStudentIds = new HashSet<>();
        List<AdminStudentListItemResponse> allItems = new ArrayList<>();

        for (User user : studentUsers) {
            processedUserIds.add(user.getId());
            if (user.getStudentId() != null && !user.getStudentId().isBlank()) {
                processedStudentIds.add(user.getStudentId().toLowerCase().trim());
            }

            UserProfile profile = profilesByUserId.get(user.getId());
            CbpRegistration reg = regsByUserId.get(user.getId());
            if (reg == null && user.getStudentId() != null) {
                reg = regsByStudentId.get(user.getStudentId().toLowerCase().trim());
            }

            String effectiveStudentId = identityResolver.resolveEffectiveStudentId(user, reg);
            String effectiveName = identityResolver.resolveEffectiveName(user, reg, profile);
            String effectiveEmail = user.getEmail();
            String effectivePhone = identityResolver.resolveEffectivePhone(user, reg, profile);
            String effectiveProgramLevel = identityResolver.resolveEffectiveProgramLevel(reg, profile);
            String effectiveDepartment = identityResolver.resolveEffectiveDepartment(reg, profile);
            String effectiveYear = identityResolver.resolveEffectiveYear(reg, profile);

            String effectiveRegStatus = reg != null && reg.getRegistrationStatus() != null
                    ? reg.getRegistrationStatus().name()
                    : "REGISTERED";

            List<Payment> regPayments = reg != null ? paymentsByRegId.get(reg.getId()) : null;
            List<Payment> userPayments = paymentsByUserId.get(user.getId());
            String effectivePayStatus = paymentStatusResolver.resolvePaymentStatus(reg, regPayments, userPayments);

            long attended = 0;
            if (!"-".equals(effectiveStudentId)) {
                attended = attendanceRecordRepository.countByStudentIdAndStatus(effectiveStudentId, AttendanceStatus.PRESENT);
            }
            double attendancePct = attendanceCalculator.calculatePercentage(attended, totalSessions);
            int profilePct = identityResolver.calculateBasicProfileCompletion(effectiveEmail, effectivePhone, effectiveDepartment, effectiveProgramLevel);

            LocalDateTime createdAt = user.getCreatedAt() != null ? user.getCreatedAt() : LocalDateTime.now();

            allItems.add(studentMapper.toListItemResponse(
                    user.getId(),
                    effectiveStudentId,
                    effectiveName,
                    effectiveEmail,
                    effectivePhone,
                    effectiveProgramLevel,
                    effectiveDepartment,
                    effectiveYear,
                    effectiveRegStatus,
                    effectivePayStatus,
                    attendancePct,
                    profilePct,
                    createdAt
            ));
        }

        // Process registrations that do not have a User entity
        List<CbpRegistration> allRegs = cbpRegistrationRepository.findAll();
        for (CbpRegistration r : allRegs) {
            boolean alreadyProcessed = (r.getUser() != null && processedUserIds.contains(r.getUser().getId()))
                    || (r.getStudentId() != null && processedStudentIds.contains(r.getStudentId().toLowerCase().trim()));

            if (alreadyProcessed) {
                continue;
            }

            String sid = r.getStudentId() != null && !r.getStudentId().isBlank() ? r.getStudentId() : "-";
            String sName = (r.getFirstName() != null ? r.getFirstName() : "") + " " + (r.getLastName() != null ? r.getLastName() : "");
            if (sName.isBlank()) sName = "Student";

            List<Payment> regPayments = paymentsByRegId.get(r.getId());
            String payStatus = paymentStatusResolver.resolvePaymentStatus(r, regPayments, null);

            long attended = 0;
            if (!"-".equals(sid)) {
                attended = attendanceRecordRepository.countByStudentIdAndStatus(sid, AttendanceStatus.PRESENT);
            }
            double attendancePct = attendanceCalculator.calculatePercentage(attended, totalSessions);

            int profilePct = (r.getPhoneNumber() != null && !r.getPhoneNumber().isBlank() ? 25 : 0)
                    + (r.getDepartment() != null && !r.getDepartment().isBlank() ? 25 : 0)
                    + (r.getProgramLevel() != null && !r.getProgramLevel().isBlank() ? 25 : 0)
                    + (r.getEmail() != null && !r.getEmail().isBlank() ? 25 : 0);

            allItems.add(studentMapper.toListItemResponse(
                    r.getId(),
                    sid,
                    sName.trim(),
                    r.getEmail() != null ? r.getEmail() : "-",
                    r.getPhoneNumber() != null ? r.getPhoneNumber() : "-",
                    r.getProgramLevel() != null ? r.getProgramLevel() : "-",
                    r.getDepartment() != null ? r.getDepartment() : "-",
                    r.getYear() != null ? r.getYear().toString() : "-",
                    r.getRegistrationStatus() != null ? r.getRegistrationStatus().name() : "REGISTERED",
                    payStatus,
                    attendancePct,
                    profilePct,
                    r.getCreatedAt() != null ? r.getCreatedAt() : LocalDateTime.now()
            ));
        }

        log.info("[AdminStudentDirectory] Total registered student entities assembled: {}", allItems.size());
        return studentFilter.filterAndPaginate(allItems, search, registrationStatus, paymentStatus, attendanceStatus, profileStatus, pageable);
    }
}

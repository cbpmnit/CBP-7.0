package com.cbp7.admin.student.helper;

import com.cbp7.admin.student.dto.response.AdminStudentListItemResponse;
import com.cbp7.attendance.record.entity.AttendanceStatus;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.enums.RegistrationStatus;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.profile.entity.UserProfile;
import com.cbp7.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
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

            String effectiveStudentId = user.getStudentId() != null && !user.getStudentId().isBlank()
                    ? user.getStudentId()
                    : (reg != null && reg.getStudentId() != null ? reg.getStudentId() : "-");

            String effectiveName = user.getName() != null && !user.getName().isBlank()
                    ? user.getName()
                    : (reg != null ? reg.getFirstName() + " " + reg.getLastName()
                    : (profile != null ? profile.getFirstName() + " " + profile.getLastName() : "Student"));

            String effectiveEmail = user.getEmail();
            String effectivePhone = user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()
                    ? user.getPhoneNumber()
                    : (reg != null && reg.getPhoneNumber() != null ? reg.getPhoneNumber()
                    : (profile != null && profile.getPhoneNumber() != null ? profile.getPhoneNumber() : "-"));

            String effectiveCourse = reg != null && reg.getCourse() != null && !reg.getCourse().isBlank()
                    ? reg.getCourse()
                    : (profile != null && profile.getCourse() != null ? profile.getCourse().name() : "-");

            String effectiveBranch = reg != null && reg.getBranch() != null && !reg.getBranch().isBlank()
                    ? reg.getBranch()
                    : (profile != null && profile.getBranch() != null ? profile.getBranch().name() : "-");

            String effectiveYear = reg != null && reg.getYear() != null
                    ? reg.getYear().toString()
                    : (profile != null && profile.getYear() != null ? profile.getYear().toString() : "-");

            String effectiveRegStatus = reg != null && reg.getRegistrationStatus() != null
                    ? reg.getRegistrationStatus().name()
                    : "REGISTERED";

            boolean isPaid = false;
            if (reg != null) {
                isPaid = reg.getRegistrationStatus() == RegistrationStatus.REGISTERED
                        || (paymentsByRegId.containsKey(reg.getId()) && paymentsByRegId.get(reg.getId()).stream().anyMatch(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS));
            }
            if (!isPaid && paymentsByUserId.containsKey(user.getId())) {
                isPaid = paymentsByUserId.get(user.getId()).stream().anyMatch(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS);
            }

            boolean isFailed = false;
            if (!isPaid) {
                if (reg != null && paymentsByRegId.containsKey(reg.getId())) {
                    isFailed = paymentsByRegId.get(reg.getId()).stream().anyMatch(p -> p.getPaymentStatus() == PaymentStatus.FAILED);
                }
                if (!isFailed && paymentsByUserId.containsKey(user.getId())) {
                    isFailed = paymentsByUserId.get(user.getId()).stream().anyMatch(p -> p.getPaymentStatus() == PaymentStatus.FAILED);
                }
            }

            String effectivePayStatus = isPaid ? "SUCCESS" : (isFailed ? "FAILED" : "PENDING");

            long attended = 0;
            if (!"-".equals(effectiveStudentId)) {
                attended = attendanceRecordRepository.countByStudentIdAndStatus(effectiveStudentId, AttendanceStatus.PRESENT);
            }
            double attendancePct = totalSessions > 0 ? ((double) attended / totalSessions) * 100.0 : 0.0;

            int profilePct = (effectivePhone != null && !"-".equals(effectivePhone) ? 25 : 0)
                    + (effectiveBranch != null && !"-".equals(effectiveBranch) ? 25 : 0)
                    + (effectiveCourse != null && !"-".equals(effectiveCourse) ? 25 : 0)
                    + (effectiveEmail != null && !effectiveEmail.isBlank() ? 25 : 0);

            LocalDateTime createdAt = user.getCreatedAt() != null
                    ? user.getCreatedAt()
                    : (reg != null && reg.getCreatedAt() != null ? reg.getCreatedAt() : LocalDateTime.now());

            allItems.add(new AdminStudentListItemResponse(
                    user.getId().toString(),
                    effectiveStudentId,
                    effectiveName,
                    effectiveEmail,
                    effectivePhone,
                    effectiveCourse,
                    effectiveBranch,
                    effectiveYear,
                    effectiveRegStatus,
                    effectivePayStatus,
                    attendancePct,
                    profilePct,
                    createdAt
            ));
        }

        for (CbpRegistration r : cbpRegistrationRepository.findAll()) {
            if (r.getUser() != null && processedUserIds.contains(r.getUser().getId())) continue;
            if (r.getStudentId() != null && processedStudentIds.contains(r.getStudentId().toLowerCase().trim())) continue;

            boolean isPaid = r.getRegistrationStatus() == RegistrationStatus.REGISTERED
                    || (paymentsByRegId.containsKey(r.getId()) && paymentsByRegId.get(r.getId()).stream().anyMatch(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS));

            long attended = attendanceRecordRepository.countByStudentIdAndStatus(r.getStudentId(), AttendanceStatus.PRESENT);
            double attendancePct = totalSessions > 0 ? ((double) attended / totalSessions) * 100.0 : 0.0;

            int profilePct = (r.getPhoneNumber() != null && !r.getPhoneNumber().isBlank() ? 25 : 0)
                    + (r.getBranch() != null && !r.getBranch().isBlank() ? 25 : 0)
                    + (r.getCourse() != null && !r.getCourse().isBlank() ? 25 : 0)
                    + (r.getEmail() != null && !r.getEmail().isBlank() ? 25 : 0);

            allItems.add(new AdminStudentListItemResponse(
                    r.getId().toString(),
                    r.getStudentId(),
                    r.getFirstName() + " " + r.getLastName(),
                    r.getEmail(),
                    r.getPhoneNumber() != null ? r.getPhoneNumber() : "-",
                    r.getCourse() != null ? r.getCourse() : "-",
                    r.getBranch() != null ? r.getBranch() : "-",
                    r.getYear() != null ? r.getYear().toString() : "-",
                    r.getRegistrationStatus().name(),
                    isPaid ? "SUCCESS" : "PENDING",
                    attendancePct,
                    profilePct,
                    r.getCreatedAt() != null ? r.getCreatedAt() : LocalDateTime.now()
            ));
        }

        log.info("[AdminStudentDirectory] Total registered student entities assembled: {}", allItems.size());

        List<AdminStudentListItemResponse> filtered = allItems.stream()
                .filter(item -> {
                    if (search != null && !search.isBlank()) {
                        String q = search.trim().toLowerCase();
                        String sid = item.studentId() != null ? item.studentId().toLowerCase() : "";
                        String name = item.name() != null ? item.name().toLowerCase() : "";
                        String email = item.email() != null ? item.email().toLowerCase() : "";
                        String phone = item.phone() != null ? item.phone().toLowerCase() : "";
                        if (!sid.contains(q) && !name.contains(q) && !email.contains(q) && !phone.contains(q)) {
                            return false;
                        }
                    }

                    if (registrationStatus != null && !registrationStatus.isBlank() && !"ALL".equalsIgnoreCase(registrationStatus)) {
                        if (!item.registrationStatus().equalsIgnoreCase(registrationStatus)) {
                            return false;
                        }
                    }

                    if (paymentStatus != null && !paymentStatus.isBlank() && !"ALL".equalsIgnoreCase(paymentStatus)) {
                        if (!item.paymentStatus().equalsIgnoreCase(paymentStatus)) {
                            return false;
                        }
                    }

                    boolean isEligible = item.attendancePercentage() >= 75.0;
                    if (attendanceStatus != null && !attendanceStatus.isBlank() && !"ALL".equalsIgnoreCase(attendanceStatus)) {
                        if ("ELIGIBLE".equalsIgnoreCase(attendanceStatus) && !isEligible) return false;
                        if ("NOT_ELIGIBLE".equalsIgnoreCase(attendanceStatus) && isEligible) return false;
                    }

                    boolean isComplete = item.profileCompletion() >= 75;
                    if (profileStatus != null && !profileStatus.isBlank() && !"ALL".equalsIgnoreCase(profileStatus)) {
                        if ("COMPLETED".equalsIgnoreCase(profileStatus) && !isComplete) return false;
                        if ("INCOMPLETE".equalsIgnoreCase(profileStatus) && isComplete) return false;
                    }

                    return true;
                })
                .sorted(Comparator.comparing(AdminStudentListItemResponse::createdAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        log.info("[AdminStudentDirectory] Filtered result count: {} matching students", filtered.size());

        if (pageable.isUnpaged()) {
            return new PageImpl<>(filtered);
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtered.size());
        List<AdminStudentListItemResponse> pageContent = start > filtered.size() ? List.of() : filtered.subList(start, end);

        return new PageImpl<>(pageContent, pageable, filtered.size());
    }
}

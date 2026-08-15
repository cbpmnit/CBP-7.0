package com.cbp7.platform.admin.student.service.impl;

import com.cbp7.platform.admin.student.dto.common.*;
import com.cbp7.platform.admin.student.dto.request.*;
import com.cbp7.platform.admin.student.dto.response.*;
import com.cbp7.platform.admin.student.entity.AdminPreferences;
import com.cbp7.platform.admin.student.StudentProfilePdfGenerator;
import com.cbp7.platform.admin.student.helper.AdminStudentCsvExporter;
import com.cbp7.platform.admin.student.helper.AdminStudentDirectoryAggregator;
import com.cbp7.platform.admin.student.AdminStudentMapper;
import com.cbp7.platform.admin.student.repository.AdminPreferencesRepository;
import com.cbp7.platform.admin.student.resolver.StudentPaymentStatusResolver;
import com.cbp7.platform.admin.student.service.AdminStudentManagementService;
import com.cbp7.program.attendance.record.AttendanceCalculator;
import com.cbp7.program.attendance.record.entity.AttendanceStatus;
import com.cbp7.program.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.program.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.program.registration.entity.RegistrationStatus;
import com.cbp7.program.registration.repository.CbpRegistrationRepository;
import com.cbp7.program.certificate.entity.Certificate;
import com.cbp7.program.certificate.repository.CertificateRepository;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.entity.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.identity.profile.entity.Gender;
import com.cbp7.identity.profile.entity.UserProfile;
import com.cbp7.identity.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminStudentManagementServiceImpl implements AdminStudentManagementService {

    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final CertificateRepository certificateRepository;
    private final AdminPreferencesRepository adminPreferencesRepository;
    private final StudentProfilePdfGenerator pdfGenerator;
    private final AdminStudentDirectoryAggregator directoryAggregator;
    private final AdminStudentMapper studentMapper;
    private final AdminStudentCsvExporter studentCsvExporter;
    private final AttendanceCalculator attendanceCalculator;
    private final StudentPaymentStatusResolver paymentStatusResolver;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminStudentListItemResponse> getStudentsPaginated(
            String search,
            String registrationStatus,
            String paymentStatus,
            String attendanceStatus,
            String profileStatus,
            Pageable pageable
    ) {
        return directoryAggregator.getStudentsPaginated(
                search, registrationStatus, paymentStatus, attendanceStatus, profileStatus, pageable
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AdminFullStudentDetailResponse getStudentFullDetail(String studentId) {
        String cleanStudentId = studentId.trim();

        Optional<CbpRegistration> regOpt = findStudentRegistration(cleanStudentId);
        Optional<User> userOpt = findStudentUser(cleanStudentId);

        if (regOpt.isEmpty() && userOpt.isEmpty()) {
            throw new ResourceNotFoundException("Student record not found for studentId: " + studentId);
        }

        CbpRegistration reg = regOpt.orElse(null);
        User user = userOpt.orElse(reg != null ? reg.getUser() : null);

        Optional<UserProfile> profileOpt = findStudentProfile(user, cleanStudentId);
        Optional<Payment> paymentOpt = findStudentPayment(reg, user);

        long totalSessions = sessionRepository.count();
        long attendedSessions = attendanceRecordRepository.countByStudentIdAndStatus(cleanStudentId, AttendanceStatus.PRESENT);
        double attendancePct = attendanceCalculator.calculatePercentage(attendedSessions, totalSessions);

        Optional<Certificate> certOpt = certificateRepository.findByStudentId(cleanStudentId);

        return studentMapper.toFullStudentDetailResponse(
                user, reg, profileOpt, paymentOpt, totalSessions, attendedSessions, attendancePct, certOpt, cleanStudentId
        );
    }

    @Override
    @Transactional
    public AdminFullStudentDetailResponse updateStudentProfile(String studentId, UpdateStudentProfileRequest request) {
        String cleanStudentId = studentId.trim();

        findStudentRegistration(cleanStudentId).ifPresent(reg -> applyRegistrationUpdates(reg, request));
        userRepository.findByStudentId(cleanStudentId).ifPresent(user -> applyUserAndProfileUpdates(user, request));

        return getStudentFullDetail(cleanStudentId);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateStudentPdf(String studentId) {
        AdminFullStudentDetailResponse student = getStudentFullDetail(studentId);
        return pdfGenerator.generateStudentProfilePdf(student);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportStudentsCsv(String search, String registrationStatus, String paymentStatus, String attendanceStatus, String profileStatus) {
        Page<AdminStudentListItemResponse> page = getStudentsPaginated(
                search, registrationStatus, paymentStatus, attendanceStatus, profileStatus, Pageable.unpaged()
        );
        return studentCsvExporter.exportStudentsCsv(page.getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getDashboardSummary() {
        List<User> studentUsers = fetchActiveStudentUsers();
        List<CbpRegistration> registrations = cbpRegistrationRepository.findAll();

        long totalStudents = studentUsers.size();
        long paymentCompleted = countPaymentCompletedStudents(studentUsers, registrations);
        long paymentPending = Math.max(0, totalStudents - paymentCompleted);
        long profileCompleted = countProfileCompletedStudents(studentUsers);

        long totalSessions = sessionRepository.count();
        double avgAttendance = calculateAverageAttendance(studentUsers, totalSessions);
        long certificateEligible = countCertificateEligibleStudents(studentUsers, totalSessions);

        return studentMapper.toDashboardStatsResponse(
                totalStudents,
                totalStudents,
                paymentCompleted,
                paymentPending,
                profileCompleted,
                avgAttendance,
                certificateEligible
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AdminPreferencesDto getAdminPreferences(String adminId) {
        Optional<AdminPreferences> prefOpt = adminPreferencesRepository.findByAdminId(adminId);
        return new AdminPreferencesDto(
                prefOpt.map(AdminPreferences::getVisibleColumns)
                        .orElse("{\"showEmail\":true,\"showPhone\":true,\"showBranch\":true,\"showPayment\":true,\"showAttendance\":true,\"showRegistration\":true}")
        );
    }

    @Override
    @Transactional
    public AdminPreferencesDto saveAdminPreferences(String adminId, AdminPreferencesDto dto) {
        AdminPreferences pref = adminPreferencesRepository.findByAdminId(adminId)
                .orElseGet(() -> AdminPreferences.builder().adminId(adminId).build());

        pref.setVisibleColumns(dto.visibleColumns());
        AdminPreferences saved = adminPreferencesRepository.save(pref);
        return new AdminPreferencesDto(saved.getVisibleColumns());
    }

    // --- Private Story Helper Methods ---

    private Optional<CbpRegistration> findStudentRegistration(String cleanStudentId) {
        return cbpRegistrationRepository.findByUserStudentIdIgnoreCase(cleanStudentId)
                .or(() -> cbpRegistrationRepository.findAll().stream()
                        .filter(r -> cleanStudentId.equalsIgnoreCase(r.getStudentId()))
                        .findFirst());
    }

    private Optional<User> findStudentUser(String cleanStudentId) {
        return userRepository.findByStudentIdIgnoreCase(cleanStudentId)
                .or(() -> userRepository.findByEmailIgnoreCase(cleanStudentId))
                .or(() -> {
                    try {
                        return userRepository.findById(UUID.fromString(cleanStudentId));
                    } catch (Exception ignored) {
                        return Optional.empty();
                    }
                });
    }

    private Optional<UserProfile> findStudentProfile(User user, String cleanStudentId) {
        return user != null
                ? userProfileRepository.findByUserId(user.getId())
                : userProfileRepository.findByUserStudentIdIgnoreCase(cleanStudentId);
    }

    private Optional<Payment> findStudentPayment(CbpRegistration reg, User user) {
        List<Payment> payments = reg != null
                ? paymentRepository.findByRegistrationId(reg.getId())
                : (user != null ? paymentRepository.findByUserId(user.getId()) : List.of());

        return payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .findFirst()
                .or(() -> payments.isEmpty() ? Optional.empty() : Optional.of(payments.get(0)));
    }

    private void applyRegistrationUpdates(CbpRegistration reg, UpdateStudentProfileRequest request) {
        if (request.firstName() != null && !request.firstName().isBlank()) reg.setFirstName(request.firstName().trim());
        if (request.lastName() != null && !request.lastName().isBlank()) reg.setLastName(request.lastName().trim());
        if (request.phone() != null) reg.setPhoneNumber(request.phone().trim());
        if (request.email() != null) reg.setEmail(request.email().trim());
        if (request.programLevel() != null) reg.setProgramLevel(request.programLevel().trim());
        if (request.department() != null) reg.setDepartment(request.department().trim());
        if (request.studentType() != null) reg.setStudentType(request.studentType().trim());
        if (request.address() != null) reg.setAddress(request.address().trim());
        if (request.hostelNumber() != null) reg.setHostelNumber(request.hostelNumber().trim());
        if (request.year() != null) {
            try {
                reg.setYear(Integer.parseInt(request.year().replaceAll("[^0-9]", "")));
            } catch (Exception ignored) {}
        }
        cbpRegistrationRepository.save(reg);
    }

    private void applyUserAndProfileUpdates(User user, UpdateStudentProfileRequest request) {
        if (request.firstName() != null || request.lastName() != null) {
            String fullName = ((request.firstName() != null ? request.firstName().trim() : "") + " " +
                    (request.lastName() != null ? request.lastName().trim() : "")).trim();
            if (!fullName.isBlank()) user.setName(fullName);
        }
        if (request.phone() != null) user.setPhoneNumber(request.phone().trim());
        if (request.email() != null) user.setEmail(request.email().trim());
        userRepository.save(user);

        userProfileRepository.findByUserId(user.getId()).ifPresent(prof -> applyProfileFields(prof, request));
    }

    private void applyProfileFields(UserProfile prof, UpdateStudentProfileRequest request) {
        if (request.firstName() != null) prof.setFirstName(request.firstName().trim());
        if (request.lastName() != null) prof.setLastName(request.lastName().trim());
        if (request.phone() != null) prof.setPhoneNumber(request.phone().trim());
        if (request.programLevel() != null) {
            try {
                prof.setProgramLevel(com.cbp7.identity.profile.entity.ProgramLevel.valueOf(request.programLevel().toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (request.department() != null) prof.setDepartment(request.department().trim());
        if (request.studentType() != null) {
            try {
                prof.setStudentType(com.cbp7.identity.profile.entity.StudentType.valueOf(request.studentType().toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (request.address() != null) prof.setAddress(request.address().trim());
        if (request.hostelNumber() != null) prof.setHostelNumber(request.hostelNumber().trim());
        if (request.gender() != null) {
            try {
                prof.setGender(Gender.valueOf(request.gender().toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (request.dob() != null) {
            try {
                prof.setDateOfBirth(LocalDate.parse(request.dob()));
            } catch (Exception ignored) {}
        }
        if (request.section() != null) prof.setSection(request.section().trim());
        if (request.hosteller() != null) prof.setHosteller(request.hosteller());
        if (request.roomNumber() != null) prof.setRoomNumber(request.roomNumber().trim());
        if (request.city() != null) prof.setCity(request.city().trim());
        if (request.state() != null) prof.setState(request.state().trim());
        userProfileRepository.save(prof);
    }

    private List<User> fetchActiveStudentUsers() {
        return userRepository.findAll().stream()
                .filter(u -> u.hasRole(Role.ROLE_STUDENT) && !u.hasRole(Role.ROLE_ADMIN) && Boolean.TRUE.equals(u.getEnabled()))
                .toList();
    }

    private long countPaymentCompletedStudents(List<User> studentUsers, List<CbpRegistration> registrations) {
        return studentUsers.stream()
                .filter(u -> isStudentPaid(u, registrations))
                .count();
    }

    private boolean isStudentPaid(User user, List<CbpRegistration> registrations) {
        boolean byReg = registrations.stream().anyMatch(r ->
                (r.getUser() != null && user.getId().equals(r.getUser().getId()) || (user.getStudentId() != null && user.getStudentId().equalsIgnoreCase(r.getStudentId())))
                        && (r.getRegistrationStatus() == RegistrationStatus.REGISTERED || paymentRepository.existsByRegistrationIdAndPaymentStatus(r.getId(), PaymentStatus.SUCCESS)));
        return byReg || paymentRepository.existsByUserIdAndPaymentStatus(user.getId(), PaymentStatus.SUCCESS);
    }

    private long countProfileCompletedStudents(List<User> studentUsers) {
        return studentUsers.stream().filter(u -> userProfileRepository.existsByUserId(u.getId())).count();
    }

    private double calculateAverageAttendance(List<User> studentUsers, long totalSessions) {
        if (studentUsers.isEmpty() || totalSessions == 0) return 0.0;
        double sumPct = 0.0;
        for (User u : studentUsers) {
            if (u.getStudentId() != null && !u.getStudentId().isBlank()) {
                long attended = attendanceRecordRepository.countByStudentIdAndStatus(u.getStudentId(), AttendanceStatus.PRESENT);
                sumPct += attendanceCalculator.calculatePercentage(attended, totalSessions);
            }
        }
        return sumPct / studentUsers.size();
    }

    private long countCertificateEligibleStudents(List<User> studentUsers, long totalSessions) {
        if (studentUsers.isEmpty() || totalSessions == 0) return 0;
        long count = 0;
        for (User u : studentUsers) {
            if (u.getStudentId() != null && !u.getStudentId().isBlank()) {
                long attended = attendanceRecordRepository.countByStudentIdAndStatus(u.getStudentId(), AttendanceStatus.PRESENT);
                double pct = attendanceCalculator.calculatePercentage(attended, totalSessions);
                if (pct >= 75.0) count++;
            }
        }
        return count;
    }
}

package com.cbp7.admin.student.service.impl;

import com.cbp7.admin.student.dto.common.*;
import com.cbp7.admin.student.dto.request.*;
import com.cbp7.admin.student.dto.response.*;
import com.cbp7.admin.student.entity.AdminPreferences;
import com.cbp7.admin.student.generator.StudentProfilePdfGenerator;
import com.cbp7.admin.student.helper.AdminStudentCsvExporter;
import com.cbp7.admin.student.helper.AdminStudentDirectoryAggregator;
import com.cbp7.admin.student.mapper.AdminStudentMapper;
import com.cbp7.admin.student.repository.AdminPreferencesRepository;
import com.cbp7.admin.student.resolver.StudentPaymentStatusResolver;
import com.cbp7.admin.student.service.AdminStudentManagementService;
import com.cbp7.attendance.record.calculator.AttendanceCalculator;
import com.cbp7.attendance.record.entity.AttendanceStatus;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.enums.RegistrationStatus;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.certificate.entity.Certificate;
import com.cbp7.certificate.repository.CertificateRepository;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.profile.entity.Gender;
import com.cbp7.profile.entity.UserProfile;
import com.cbp7.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

        Optional<CbpRegistration> regOpt = cbpRegistrationRepository.findByUserStudentIdIgnoreCase(cleanStudentId)
                .or(() -> cbpRegistrationRepository.findAll().stream().filter(r -> cleanStudentId.equalsIgnoreCase(r.getStudentId())).findFirst());

        Optional<User> userOpt = userRepository.findByStudentIdIgnoreCase(cleanStudentId)
                .or(() -> userRepository.findByEmailIgnoreCase(cleanStudentId))
                .or(() -> {
                    try {
                        return userRepository.findById(UUID.fromString(cleanStudentId));
                    } catch (Exception ignored) {
                        return Optional.empty();
                    }
                });

        if (regOpt.isEmpty() && userOpt.isEmpty()) {
            throw new ResourceNotFoundException("Student record not found for studentId: " + studentId);
        }

        CbpRegistration reg = regOpt.orElse(null);
        User user = userOpt.orElse(reg != null ? reg.getUser() : null);

        Optional<UserProfile> profileOpt = user != null
                ? userProfileRepository.findByUserId(user.getId())
                : userProfileRepository.findByUserStudentIdIgnoreCase(cleanStudentId);

        List<Payment> payments = reg != null
                ? paymentRepository.findByRegistrationId(reg.getId())
                : (user != null ? paymentRepository.findByUserId(user.getId()) : List.of());

        Optional<Payment> paymentOpt = payments.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS).findFirst();
        if (paymentOpt.isEmpty() && !payments.isEmpty()) paymentOpt = Optional.of(payments.get(0));

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

        Optional<CbpRegistration> regOpt = cbpRegistrationRepository.findByUserStudentIdIgnoreCase(cleanStudentId)
                .or(() -> cbpRegistrationRepository.findAll().stream().filter(r -> cleanStudentId.equalsIgnoreCase(r.getStudentId())).findFirst());

        if (regOpt.isPresent()) {
            CbpRegistration reg = regOpt.get();
            if (request.firstName() != null && !request.firstName().isBlank()) reg.setFirstName(request.firstName().trim());
            if (request.lastName() != null && !request.lastName().isBlank()) reg.setLastName(request.lastName().trim());
            if (request.phone() != null) reg.setPhoneNumber(request.phone().trim());
            if (request.email() != null) reg.setEmail(request.email().trim());
            if (request.course() != null) reg.setCourse(request.course().trim());
            if (request.branch() != null) reg.setBranch(request.branch().trim());
            if (request.year() != null) {
                try {
                    reg.setYear(Integer.parseInt(request.year().replaceAll("[^0-9]", "")));
                } catch (Exception ignored) {}
            }
            cbpRegistrationRepository.save(reg);
        }

        Optional<User> userOpt = userRepository.findByStudentId(cleanStudentId);
        if (userOpt.isPresent()) {
            User u = userOpt.get();
            if (request.firstName() != null || request.lastName() != null) {
                String fullName = ((request.firstName() != null ? request.firstName().trim() : "") + " " +
                        (request.lastName() != null ? request.lastName().trim() : "")).trim();
                if (!fullName.isBlank()) u.setName(fullName);
            }
            if (request.phone() != null) u.setPhoneNumber(request.phone().trim());
            if (request.email() != null) u.setEmail(request.email().trim());
            userRepository.save(u);

            Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(u.getId());
            if (profileOpt.isPresent()) {
                UserProfile prof = profileOpt.get();
                if (request.firstName() != null) prof.setFirstName(request.firstName().trim());
                if (request.lastName() != null) prof.setLastName(request.lastName().trim());
                if (request.phone() != null) prof.setPhoneNumber(request.phone().trim());
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
        }

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
        List<User> studentUsers = userRepository.findAll().stream()
                .filter(u -> u.hasRole(Role.ROLE_STUDENT) && !u.hasRole(Role.ROLE_ADMIN) && Boolean.TRUE.equals(u.getEnabled()))
                .toList();

        long totalStudents = studentUsers.size();
        long registered = totalStudents;

        List<CbpRegistration> registrations = cbpRegistrationRepository.findAll();
        long paymentCompleted = studentUsers.stream()
                .filter(u -> {
                    boolean byReg = registrations.stream().anyMatch(r ->
                            (r.getUser() != null && u.getId().equals(r.getUser().getId()) || (u.getStudentId() != null && u.getStudentId().equalsIgnoreCase(r.getStudentId())))
                                    && (r.getRegistrationStatus() == RegistrationStatus.REGISTERED || paymentRepository.existsByRegistrationIdAndPaymentStatus(r.getId(), PaymentStatus.SUCCESS)));
                    return byReg || paymentRepository.existsByUserIdAndPaymentStatus(u.getId(), PaymentStatus.SUCCESS);
                })
                .count();

        long paymentPending = Math.max(0, totalStudents - paymentCompleted);

        long profileCompleted = studentUsers.stream()
                .filter(u -> userProfileRepository.existsByUserId(u.getId()))
                .count();

        long totalSessions = sessionRepository.count();
        double avgAttendance = 0.0;
        long certificateEligible = 0;

        if (totalStudents > 0 && totalSessions > 0) {
            double sumPct = 0.0;
            for (User u : studentUsers) {
                if (u.getStudentId() != null && !u.getStudentId().isBlank()) {
                    long attended = attendanceRecordRepository.countByStudentIdAndStatus(u.getStudentId(), AttendanceStatus.PRESENT);
                    double pct = attendanceCalculator.calculatePercentage(attended, totalSessions);
                    sumPct += pct;
                    if (pct >= 75.0) certificateEligible++;
                }
            }
            avgAttendance = sumPct / totalStudents;
        }

        return studentMapper.toDashboardStatsResponse(
                totalStudents,
                registered,
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
}

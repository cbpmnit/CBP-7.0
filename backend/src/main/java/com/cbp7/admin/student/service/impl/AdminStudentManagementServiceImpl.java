package com.cbp7.admin.student.service.impl;

import com.cbp7.admin.student.dto.common.*;
import com.cbp7.admin.student.dto.request.*;
import com.cbp7.admin.student.dto.response.*;
import com.cbp7.admin.student.entity.AdminPreferences;
import com.cbp7.admin.student.generator.StudentProfilePdfGenerator;
import com.cbp7.admin.student.helper.AdminStudentDirectoryAggregator;
import com.cbp7.admin.student.repository.AdminPreferencesRepository;
import com.cbp7.admin.student.service.AdminStudentManagementService;
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
import com.cbp7.common.util.CsvExportUtil;
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
        double attendancePct = totalSessions > 0 ? ((double) attendedSessions / totalSessions) * 100.0 : 0.0;

        Optional<Certificate> certOpt = certificateRepository.findByStudentId(cleanStudentId);

        String idStr = user != null ? user.getId().toString() : (reg != null ? reg.getId().toString() : cleanStudentId);
        String nameStr = user != null && user.getName() != null ? user.getName() : (reg != null ? reg.getFirstName() + " " + reg.getLastName() : "Student");
        String emailStr = user != null ? user.getEmail() : (reg != null ? reg.getEmail() : cleanStudentId);
        String phoneStr = user != null && user.getPhoneNumber() != null ? user.getPhoneNumber() : (reg != null ? reg.getPhoneNumber() : "-");

        var basic = new AdminFullStudentDetailResponse.StudentBasicDto(
                idStr,
                cleanStudentId,
                nameStr,
                emailStr,
                phoneStr
        );

        String fName = reg != null ? reg.getFirstName() : (profileOpt.map(UserProfile::getFirstName).orElse("Student"));
        String lName = reg != null ? reg.getLastName() : (profileOpt.map(UserProfile::getLastName).orElse(""));
        String gender = profileOpt.map(p -> p.getGender() != null ? p.getGender().name() : "MALE").orElse("MALE");
        String dob = profileOpt.map(p -> p.getDateOfBirth() != null ? p.getDateOfBirth().toString() : "Not specified").orElse("Not specified");
        String institute = reg != null && reg.getInstitute() != null ? reg.getInstitute() : profileOpt.map(UserProfile::getInstitute).orElse("MNIT Jaipur");
        String course = reg != null ? reg.getCourse() : profileOpt.map(p -> p.getCourse() != null ? p.getCourse().name() : "-").orElse("-");
        String branch = reg != null ? reg.getBranch() : profileOpt.map(p -> p.getBranch() != null ? p.getBranch().name() : "-").orElse("-");
        String year = reg != null && reg.getYear() != null ? reg.getYear().toString() : profileOpt.map(p -> p.getYear() != null ? p.getYear().toString() : "1").orElse("1");
        String section = profileOpt.map(UserProfile::getSection).orElse(reg != null && reg.getSection() != null ? reg.getSection() : "A");
        boolean hosteller = profileOpt.map(UserProfile::getHosteller).orElse(reg != null && reg.getHosteller() != null ? reg.getHosteller() : false);
        String room = profileOpt.map(UserProfile::getRoomNumber).orElse(reg != null && reg.getRoomNumber() != null ? reg.getRoomNumber() : "-");
        String city = profileOpt.map(UserProfile::getCity).orElse(reg != null && reg.getCity() != null ? reg.getCity() : "Jaipur");
        String state = profileOpt.map(UserProfile::getState).orElse(reg != null && reg.getState() != null ? reg.getState() : "Rajasthan");

        var profileDto = new AdminFullStudentDetailResponse.ProfileDetailDto(
                fName, lName, gender, dob, institute, course, branch, year, section, hosteller, room, city, state
        );

        var regDto = new AdminFullStudentDetailResponse.RegistrationDetailDto(
                reg != null ? reg.getRegistrationId() : "REG_PENDING",
                reg != null ? reg.getRegistrationStatus().name() : "REGISTERED",
                reg != null ? reg.getCreatedAt() : (user != null ? user.getCreatedAt() : LocalDateTime.now())
        );

        boolean isPaid = (reg != null && reg.getRegistrationStatus() == RegistrationStatus.REGISTERED)
                || paymentOpt.map(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS).orElse(false);

        var payDto = new AdminFullStudentDetailResponse.PaymentDetailDto(
                isPaid ? "SUCCESS" : "PENDING",
                paymentOpt.map(p -> p.getAmount() != null ? p.getAmount().doubleValue() : 500.0).orElse(500.0),
                paymentOpt.map(Payment::getTransactionId).orElse("TXN_MNIT_CBP7"),
                paymentOpt.map(Payment::getCreatedAt).orElse(user != null ? user.getCreatedAt() : LocalDateTime.now())
        );

        var attDto = new AdminFullStudentDetailResponse.AttendanceDetailDto(
                totalSessions,
                attendedSessions,
                attendancePct
        );

        var certDto = new AdminFullStudentDetailResponse.CertificateDetailDto(
                certOpt.isPresent() ? "ISSUED" : (attendancePct >= 75.0 ? "ELIGIBLE" : "NOT_ELIGIBLE"),
                certOpt.map(Certificate::getCertificateNumber).orElse("-"),
                certOpt.map(Certificate::getCreatedAt).orElse(null)
        );

        return new AdminFullStudentDetailResponse(basic, profileDto, regDto, payDto, attDto, certDto);
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
            User user = userOpt.get();
            if (request.firstName() != null) user.setName(request.firstName() + " " + (request.lastName() != null ? request.lastName() : ""));
            if (request.email() != null) user.setEmail(request.email().trim());
            if (request.phone() != null) user.setPhoneNumber(request.phone().trim());
            userRepository.save(user);
        }

        Optional<UserProfile> profileOpt = userProfileRepository.findByUserStudentIdIgnoreCase(cleanStudentId);
        if (profileOpt.isPresent()) {
            UserProfile profile = profileOpt.get();
            if (request.gender() != null) {
                try {
                    profile.setGender(Gender.valueOf(request.gender().toUpperCase()));
                } catch (Exception ignored) {}
            }
            if (request.dob() != null) {
                try {
                    profile.setDateOfBirth(LocalDate.parse(request.dob()));
                } catch (Exception ignored) {}
            }
            if (request.section() != null) profile.setSection(request.section());
            if (request.hosteller() != null) profile.setHosteller(request.hosteller());
            if (request.roomNumber() != null) profile.setRoomNumber(request.roomNumber());
            if (request.city() != null) profile.setCity(request.city());
            if (request.state() != null) profile.setState(request.state());

            userProfileRepository.save(profile);
        }

        log.info("Admin updated student profile for studentId: {}", cleanStudentId);
        return getStudentFullDetail(cleanStudentId);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateStudentPdf(String studentId) {
        AdminFullStudentDetailResponse detail = getStudentFullDetail(studentId);
        return pdfGenerator.generateStudentProfilePdf(detail);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportStudentsCsv(String search, String registrationStatus, String paymentStatus, String attendanceStatus, String profileStatus) {
        Page<AdminStudentListItemResponse> pageRes = getStudentsPaginated(
                search, registrationStatus, paymentStatus, attendanceStatus, profileStatus, Pageable.unpaged()
        );

        List<String> headers = List.of(
                "Student ID", "Name", "Email", "Phone", "Course", "Branch", "Year",
                "Registration Status", "Payment Status", "Attendance %"
        );

        List<List<String>> rows = new ArrayList<>();
        for (AdminStudentListItemResponse item : pageRes.getContent()) {
            rows.add(List.of(
                    item.studentId() != null ? item.studentId() : "",
                    item.name() != null ? item.name() : "",
                    item.email() != null ? item.email() : "",
                    item.phone() != null ? item.phone() : "",
                    item.course() != null ? item.course() : "",
                    item.branch() != null ? item.branch() : "",
                    item.year() != null ? item.year() : "",
                    item.registrationStatus() != null ? item.registrationStatus() : "",
                    item.paymentStatus() != null ? item.paymentStatus() : "",
                    String.format("%.1f%%", item.attendancePercentage())
            ));
        }

        return CsvExportUtil.generateCsv(headers, rows);
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
                    double pct = ((double) attended / totalSessions) * 100.0;
                    sumPct += pct;
                    if (pct >= 75.0) certificateEligible++;
                }
            }
            avgAttendance = sumPct / totalStudents;
        }

        return new AdminDashboardStatsResponse(
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

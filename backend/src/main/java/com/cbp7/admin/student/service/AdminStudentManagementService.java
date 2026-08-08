package com.cbp7.admin.student.service;

import com.cbp7.admin.student.dto.*;
import com.cbp7.admin.student.entity.AdminPreferences;
import com.cbp7.admin.student.generator.StudentProfilePdfGenerator;
import com.cbp7.admin.student.repository.AdminPreferencesRepository;
import com.cbp7.attendance.record.entity.AttendanceStatus;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.attendance.session.repository.AttendanceSessionRepository;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminStudentManagementService {

    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final CertificateRepository certificateRepository;
    private final AdminPreferencesRepository adminPreferencesRepository;
    private final StudentProfilePdfGenerator pdfGenerator;

    @Transactional(readOnly = true)
    public Page<AdminStudentListItemResponse> getStudentsPaginated(
            String search,
            String registrationStatus,
            String paymentStatus,
            String attendanceStatus,
            String profileStatus,
            Pageable pageable
    ) {
        List<CbpRegistration> allRegs = cbpRegistrationRepository.findAll();
        long totalSessions = sessionRepository.count();

        List<AdminStudentListItemResponse> filtered = allRegs.stream()
                .filter(r -> {
                    if (search != null && !search.isBlank()) {
                        String q = search.trim().toLowerCase();
                        String sid = r.getStudentId() != null ? r.getStudentId().toLowerCase() : "";
                        String name = (r.getFirstName() + " " + r.getLastName()).toLowerCase();
                        String email = r.getEmail() != null ? r.getEmail().toLowerCase() : "";
                        String phone = r.getPhoneNumber() != null ? r.getPhoneNumber().toLowerCase() : "";
                        if (!sid.contains(q) && !name.contains(q) && !email.contains(q) && !phone.contains(q)) {
                            return false;
                        }
                    }

                    if (registrationStatus != null && !registrationStatus.isBlank() && !"ALL".equalsIgnoreCase(registrationStatus)) {
                        if (!r.getRegistrationStatus().name().equalsIgnoreCase(registrationStatus)) {
                            return false;
                        }
                    }

                    boolean isPaid = r.getRegistrationStatus() == RegistrationStatus.REGISTERED
                            || paymentRepository.existsByRegistrationIdAndPaymentStatus(r.getId(), PaymentStatus.SUCCESS);

                    if (paymentStatus != null && !paymentStatus.isBlank() && !"ALL".equalsIgnoreCase(paymentStatus)) {
                        if ("SUCCESS".equalsIgnoreCase(paymentStatus) && !isPaid) return false;
                        if ("PENDING".equalsIgnoreCase(paymentStatus) && isPaid) return false;
                        if ("FAILED".equalsIgnoreCase(paymentStatus) && isPaid) return false;
                    }

                    long attended = attendanceRecordRepository.countByStudentIdAndStatus(r.getStudentId(), AttendanceStatus.PRESENT);
                    double pct = totalSessions > 0 ? ((double) attended / totalSessions) * 100.0 : 0.0;
                    boolean isEligible = pct >= 75.0;

                    if (attendanceStatus != null && !attendanceStatus.isBlank() && !"ALL".equalsIgnoreCase(attendanceStatus)) {
                        if ("ELIGIBLE".equalsIgnoreCase(attendanceStatus) && !isEligible) return false;
                        if ("NOT_ELIGIBLE".equalsIgnoreCase(attendanceStatus) && isEligible) return false;
                    }

                    boolean isProfileComplete = r.getFirstName() != null && !r.getFirstName().isBlank()
                            && r.getEmail() != null && !r.getEmail().isBlank()
                            && r.getBranch() != null && !r.getBranch().isBlank();

                    if (profileStatus != null && !profileStatus.isBlank() && !"ALL".equalsIgnoreCase(profileStatus)) {
                        if ("COMPLETED".equalsIgnoreCase(profileStatus) && !isProfileComplete) return false;
                        if ("INCOMPLETE".equalsIgnoreCase(profileStatus) && isProfileComplete) return false;
                    }

                    return true;
                })
                .map(r -> {
                    long attended = attendanceRecordRepository.countByStudentIdAndStatus(r.getStudentId(), AttendanceStatus.PRESENT);
                    double pct = totalSessions > 0 ? ((double) attended / totalSessions) * 100.0 : 0.0;
                    boolean isPaid = r.getRegistrationStatus() == RegistrationStatus.REGISTERED
                            || paymentRepository.existsByRegistrationIdAndPaymentStatus(r.getId(), PaymentStatus.SUCCESS);

                    int profilePct = (r.getPhoneNumber() != null && !r.getPhoneNumber().isBlank() ? 25 : 0)
                            + (r.getBranch() != null && !r.getBranch().isBlank() ? 25 : 0)
                            + (r.getCourse() != null && !r.getCourse().isBlank() ? 25 : 0)
                            + (r.getEmail() != null && !r.getEmail().isBlank() ? 25 : 0);

                    return new AdminStudentListItemResponse(
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
                            pct,
                            profilePct,
                            r.getCreatedAt()
                    );
                })
                .toList();

        if (pageable.isUnpaged()) {
            return new PageImpl<>(filtered);
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtered.size());
        List<AdminStudentListItemResponse> pageContent = start > filtered.size() ? List.of() : filtered.subList(start, end);

        return new PageImpl<>(pageContent, pageable, filtered.size());
    }

    @Transactional(readOnly = true)
    public AdminFullStudentDetailResponse getStudentFullDetail(String studentId) {
        String cleanStudentId = studentId.trim();

        CbpRegistration reg = cbpRegistrationRepository.findByUserStudentIdIgnoreCase(cleanStudentId)
                .or(() -> cbpRegistrationRepository.findAll().stream().filter(r -> cleanStudentId.equalsIgnoreCase(r.getStudentId())).findFirst())
                .orElseThrow(() -> new ResourceNotFoundException("Student registration record not found for studentId: " + studentId));

        Optional<UserProfile> profileOpt = userProfileRepository.findByUserStudentIdIgnoreCase(cleanStudentId);

        List<Payment> payments = paymentRepository.findByRegistrationId(reg.getId());
        Optional<Payment> paymentOpt = payments.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS).findFirst();
        if (paymentOpt.isEmpty() && !payments.isEmpty()) paymentOpt = Optional.of(payments.get(0));

        long totalSessions = sessionRepository.count();
        long attendedSessions = attendanceRecordRepository.countByStudentIdAndStatus(cleanStudentId, AttendanceStatus.PRESENT);
        double attendancePct = totalSessions > 0 ? ((double) attendedSessions / totalSessions) * 100.0 : 0.0;

        Optional<Certificate> certOpt = certificateRepository.findByStudentId(cleanStudentId);

        var basic = new AdminFullStudentDetailResponse.StudentBasicDto(
                reg.getId().toString(),
                reg.getStudentId(),
                reg.getFirstName() + " " + reg.getLastName(),
                reg.getEmail(),
                reg.getPhoneNumber()
        );

        var profileDto = new AdminFullStudentDetailResponse.ProfileDetailDto(
                reg.getFirstName(),
                reg.getLastName(),
                profileOpt.map(p -> p.getGender() != null ? p.getGender().name() : "MALE").orElse("MALE"),
                profileOpt.map(p -> p.getDateOfBirth() != null ? p.getDateOfBirth().toString() : "Not specified").orElse("Not specified"),
                reg.getInstitute() != null ? reg.getInstitute() : "MNIT Jaipur",
                reg.getCourse(),
                reg.getBranch(),
                reg.getYear() != null ? reg.getYear().toString() : "1",
                profileOpt.map(UserProfile::getSection).orElse(reg.getSection() != null ? reg.getSection() : "A"),
                profileOpt.map(UserProfile::getHosteller).orElse(reg.getHosteller() != null ? reg.getHosteller() : false),
                profileOpt.map(UserProfile::getRoomNumber).orElse(reg.getRoomNumber() != null ? reg.getRoomNumber() : "-"),
                profileOpt.map(UserProfile::getCity).orElse(reg.getCity() != null ? reg.getCity() : "Jaipur"),
                profileOpt.map(UserProfile::getState).orElse(reg.getState() != null ? reg.getState() : "Rajasthan")
        );

        var regDto = new AdminFullStudentDetailResponse.RegistrationDetailDto(
                reg.getRegistrationId(),
                reg.getRegistrationStatus().name(),
                reg.getCreatedAt()
        );

        boolean isPaid = reg.getRegistrationStatus() == RegistrationStatus.REGISTERED || paymentOpt.map(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS).orElse(false);

        var payDto = new AdminFullStudentDetailResponse.PaymentDetailDto(
                isPaid ? "SUCCESS" : "PENDING",
                paymentOpt.map(p -> p.getAmount() != null ? p.getAmount().doubleValue() : 500.0).orElse(500.0),
                paymentOpt.map(Payment::getTransactionId).orElse("TXN_MNIT_CBP7"),
                paymentOpt.map(Payment::getCreatedAt).orElse(reg.getCreatedAt())
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

    @Transactional
    public AdminFullStudentDetailResponse updateStudentProfile(String studentId, UpdateStudentProfileRequest request) {
        String cleanStudentId = studentId.trim();

        CbpRegistration reg = cbpRegistrationRepository.findByUserStudentIdIgnoreCase(cleanStudentId)
                .or(() -> cbpRegistrationRepository.findAll().stream().filter(r -> cleanStudentId.equalsIgnoreCase(r.getStudentId())).findFirst())
                .orElseThrow(() -> new ResourceNotFoundException("Student registration record not found for studentId: " + studentId));

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

        // Also update User entity if name/email/phone changed
        Optional<User> userOpt = userRepository.findByStudentId(cleanStudentId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (request.firstName() != null) user.setName(request.firstName() + " " + (request.lastName() != null ? request.lastName() : ""));
            if (request.email() != null) user.setEmail(request.email().trim());
            if (request.phone() != null) user.setPhoneNumber(request.phone().trim());
            userRepository.save(user);
        }

        // Also update UserProfile entity
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

    @Transactional(readOnly = true)
    public byte[] generateStudentPdf(String studentId) {
        AdminFullStudentDetailResponse detail = getStudentFullDetail(studentId);
        return pdfGenerator.generateStudentProfilePdf(detail);
    }

    @Transactional(readOnly = true)
    public byte[] exportStudentsCsv(String paymentStatus, String registrationStatus, String search) {
        Page<AdminStudentListItemResponse> pageRes = getStudentsPaginated(
                search, registrationStatus, paymentStatus, "ALL", "ALL", Pageable.unpaged()
        );

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            writer.println("Student ID,Name,Email,Phone,Course,Branch,Year,Registration Status,Payment Status,Attendance %");

            for (AdminStudentListItemResponse item : pageRes.getContent()) {
                writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%.1f%%\"%n",
                        escapeCsv(item.studentId()),
                        escapeCsv(item.name()),
                        escapeCsv(item.email()),
                        escapeCsv(item.phone()),
                        escapeCsv(item.course()),
                        escapeCsv(item.branch()),
                        escapeCsv(item.year()),
                        escapeCsv(item.registrationStatus()),
                        escapeCsv(item.paymentStatus()),
                        item.attendancePercentage()
                );
            }
            writer.flush();
            return out.toByteArray();
        }
    }

    private String escapeCsv(String input) {
        if (input == null) return "";
        return input.replace("\"", "\"\"");
    }

    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getDashboardSummary() {
        List<CbpRegistration> registrations = cbpRegistrationRepository.findAll();
        long totalStudents = registrations.size();
        long registered = totalStudents;

        long paymentCompleted = registrations.stream()
                .filter(r -> r.getRegistrationStatus() == RegistrationStatus.REGISTERED
                        || paymentRepository.existsByRegistrationIdAndPaymentStatus(r.getId(), PaymentStatus.SUCCESS))
                .count();

        long paymentPending = Math.max(0, totalStudents - paymentCompleted);

        long profileCompleted = registrations.stream()
                .filter(r -> r.getFirstName() != null && !r.getFirstName().isBlank() && r.getBranch() != null && !r.getBranch().isBlank())
                .count();

        long totalSessions = sessionRepository.count();
        double avgAttendance = 0.0;
        long certificateEligible = 0;

        if (totalStudents > 0 && totalSessions > 0) {
            double sumPct = 0.0;
            for (CbpRegistration r : registrations) {
                long attended = attendanceRecordRepository.countByStudentIdAndStatus(r.getStudentId(), AttendanceStatus.PRESENT);
                double pct = ((double) attended / totalSessions) * 100.0;
                sumPct += pct;
                if (pct >= 75.0) certificateEligible++;
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

    @Transactional(readOnly = true)
    public AdminPreferencesDto getAdminPreferences(String adminId) {
        Optional<AdminPreferences> prefOpt = adminPreferencesRepository.findByAdminId(adminId);
        return new AdminPreferencesDto(
                prefOpt.map(AdminPreferences::getVisibleColumns)
                        .orElse("{\"showEmail\":true,\"showPhone\":true,\"showBranch\":true,\"showPayment\":true,\"showAttendance\":true,\"showRegistration\":true}")
        );
    }

    @Transactional
    public AdminPreferencesDto saveAdminPreferences(String adminId, AdminPreferencesDto dto) {
        AdminPreferences pref = adminPreferencesRepository.findByAdminId(adminId)
                .orElseGet(() -> AdminPreferences.builder().adminId(adminId).build());

        pref.setVisibleColumns(dto.visibleColumns());
        AdminPreferences saved = adminPreferencesRepository.save(pref);
        return new AdminPreferencesDto(saved.getVisibleColumns());
    }
}

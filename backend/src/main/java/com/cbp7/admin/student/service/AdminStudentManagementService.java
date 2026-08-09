package com.cbp7.admin.student.service;

import com.cbp7.admin.student.dto.*;
import com.cbp7.admin.student.entity.AdminPreferences;
import com.cbp7.admin.student.generator.StudentProfilePdfGenerator;
import com.cbp7.admin.student.repository.AdminPreferencesRepository;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
        log.info("[AdminStudentDirectory] Fetching students with filters: search='{}', registrationStatus='{}', paymentStatus='{}', attendanceStatus='{}', profileStatus='{}', page={}, size={}",
                search, registrationStatus, paymentStatus, attendanceStatus, profileStatus,
                pageable.isPaged() ? pageable.getPageNumber() : 0,
                pageable.isPaged() ? pageable.getPageSize() : "ALL");

        // 1. Fetch all student users from identity.users (Role.ROLE_STUDENT)
        List<User> allUsers = userRepository.findAll();
        List<User> studentUsers = allUsers.stream()
                .filter(u -> u.hasRole(Role.ROLE_STUDENT) && !u.hasRole(Role.ROLE_ADMIN) && Boolean.TRUE.equals(u.getEnabled()))
                .toList();

        // 2. Pre-fetch related datasets for fast O(1) in-memory joining
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

        // Set to track processed user IDs and student IDs
        Set<UUID> processedUserIds = new HashSet<>();
        Set<String> processedStudentIds = new HashSet<>();
        List<AdminStudentListItemResponse> allItems = new ArrayList<>();

        // Process student user accounts
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

        // Include any remaining CbpRegistration records whose user wasn't in studentUsers
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

        // 3. Apply Filters
        List<AdminStudentListItemResponse> filtered = allItems.stream()
                .filter(item -> {
                    // Search filter
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

                    // Registration Status filter
                    if (registrationStatus != null && !registrationStatus.isBlank() && !"ALL".equalsIgnoreCase(registrationStatus)) {
                        if (!item.registrationStatus().equalsIgnoreCase(registrationStatus)) {
                            return false;
                        }
                    }

                    // Payment Status filter
                    if (paymentStatus != null && !paymentStatus.isBlank() && !"ALL".equalsIgnoreCase(paymentStatus)) {
                        if (!item.paymentStatus().equalsIgnoreCase(paymentStatus)) {
                            return false;
                        }
                    }

                    // Attendance Status filter
                    boolean isEligible = item.attendancePercentage() >= 75.0;
                    if (attendanceStatus != null && !attendanceStatus.isBlank() && !"ALL".equalsIgnoreCase(attendanceStatus)) {
                        if ("ELIGIBLE".equalsIgnoreCase(attendanceStatus) && !isEligible) return false;
                        if ("NOT_ELIGIBLE".equalsIgnoreCase(attendanceStatus) && isEligible) return false;
                    }

                    // Profile Completion filter
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

    @Transactional(readOnly = true)
    public AdminFullStudentDetailResponse getStudentFullDetail(String studentId) {
        String cleanStudentId = studentId.trim();

        // 1. Try to find CbpRegistration
        Optional<CbpRegistration> regOpt = cbpRegistrationRepository.findByUserStudentIdIgnoreCase(cleanStudentId)
                .or(() -> cbpRegistrationRepository.findAll().stream().filter(r -> cleanStudentId.equalsIgnoreCase(r.getStudentId())).findFirst());

        // 2. Try to find User
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

        // Also update User entity if exists
        Optional<User> userOpt = userRepository.findByStudentId(cleanStudentId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (request.firstName() != null) user.setName(request.firstName() + " " + (request.lastName() != null ? request.lastName() : ""));
            if (request.email() != null) user.setEmail(request.email().trim());
            if (request.phone() != null) user.setPhoneNumber(request.phone().trim());
            userRepository.save(user);
        }

        // Also update UserProfile entity if exists
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

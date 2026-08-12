package com.cbp7.platform.admin.student.mapper;

import com.cbp7.platform.admin.student.dto.response.AdminDashboardStatsResponse;
import com.cbp7.platform.admin.student.dto.response.AdminFullStudentDetailResponse;
import com.cbp7.platform.admin.student.dto.response.AdminStudentListItemResponse;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.program.registration.enums.RegistrationStatus;
import com.cbp7.program.certificate.entity.Certificate;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.identity.profile.entity.UserProfile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Component
public class AdminStudentMapper {

    public AdminStudentListItemResponse toListItemResponse(
            UUID id,
            String studentId,
            String name,
            String email,
            String phone,
            String course,
            String branch,
            String year,
            String registrationStatus,
            String paymentStatus,
            double attendancePercentage,
            int profileCompletion,
            LocalDateTime createdAt
    ) {
        return new AdminStudentListItemResponse(
                id != null ? id.toString() : "",
                studentId,
                name,
                email,
                phone,
                course,
                branch,
                year,
                registrationStatus,
                paymentStatus,
                attendancePercentage,
                profileCompletion,
                createdAt
        );
    }

    public AdminFullStudentDetailResponse toFullStudentDetailResponse(
            User user,
            CbpRegistration reg,
            Optional<UserProfile> profileOpt,
            Optional<Payment> paymentOpt,
            long totalSessions,
            long attendedSessions,
            double attendancePct,
            Optional<Certificate> certOpt,
            String cleanStudentId
    ) {
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

    public AdminDashboardStatsResponse toDashboardStatsResponse(
            long totalStudents,
            long registered,
            long paymentCompleted,
            long paymentPending,
            long profileCompleted,
            double avgAttendance,
            long certificateEligible
    ) {
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
}

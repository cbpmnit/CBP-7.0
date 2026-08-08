package com.cbp7.certificate;

import com.cbp7.attendance.record.dto.StudentAttendanceSummaryResponse;
import com.cbp7.attendance.record.service.AttendanceQueryService;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.enums.RegistrationStatus;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.certificate.dto.CertificateResponse;
import com.cbp7.certificate.entity.CertificateStatus;
import com.cbp7.certificate.entity.CertificateType;
import com.cbp7.certificate.repository.CertificateRepository;
import com.cbp7.certificate.service.CertificateService;
import com.cbp7.notification.event.CertificateGeneratedEvent;
import com.cbp7.notification.event.NotificationEventPublisher;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.profile.entity.Branch;
import com.cbp7.profile.entity.Course;
import com.cbp7.profile.entity.Gender;
import com.cbp7.profile.entity.UserProfile;
import com.cbp7.profile.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS identity; CREATE SCHEMA IF NOT EXISTS program; CREATE SCHEMA IF NOT EXISTS platform;"
})
class CertificateServiceTest {

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private CbpRegistrationRepository cbpRegistrationRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @MockitoBean
    private AttendanceQueryService attendanceQueryService;

    @MockitoBean
    private NotificationEventPublisher notificationEventPublisher;

    private User studentUser;
    private UserProfile userProfile;
    private CbpRegistration registration;

    @BeforeEach
    void setUp() {
        certificateRepository.deleteAll();

        studentUser = userRepository.findByStudentId("2024cert001")
                .orElseGet(() -> userRepository.save(User.builder()
                        .studentId("2024cert001")
                        .email("certstudent@mnit.ac.in")
                        .name("Certificate Student")
                        .password("password123")
                        .role(Role.ROLE_STUDENT)
                        .enabled(true)
                        .build()));

        userProfile = userProfileRepository.save(UserProfile.builder()
                .user(studentUser)
                .firstName("Certificate")
                .lastName("Student")
                .gender(Gender.MALE)
                .phoneNumber("9999999999")
                .sameAsWhatsapp(true)
                .course(Course.BTECH)
                .branch(Branch.COMPUTER_SCIENCE_ENGINEERING)
                .year(4)
                .hosteller(true)
                .build());

        registration = cbpRegistrationRepository.findByUserStudentIdIgnoreCase("2024cert001")
                .orElseGet(() -> cbpRegistrationRepository.save(CbpRegistration.builder()
                        .user(studentUser)
                        .profile(userProfile)
                        .registrationId("REG-CERT-001")
                        .registrationStatus(RegistrationStatus.REGISTERED)
                        .studentId("2024cert001")
                        .firstName("Certificate")
                        .lastName("Student")
                        .email("certstudent@mnit.ac.in")
                        .phoneNumber("9999999999")
                        .institute("MNIT")
                        .course("B.Tech")
                        .branch("CSE")
                        .year(4)
                        .hosteller(true)
                        .build()));
    }

    @Test
    @DisplayName("1. Eligible student gets certificate generated successfully")
    void eligibleStudentGetsCertificate() {
        when(attendanceQueryService.getStudentAttendanceSummary("2024cert001"))
                .thenReturn(new StudentAttendanceSummaryResponse("2024cert001", 10, 8, 80.0, new ArrayList<>()));

        CertificateResponse response = certificateService.generateCertificateForStudent("2024cert001");

        assertNotNull(response);
        assertNotNull(response.certificateNumber());
        assertTrue(response.certificateNumber().startsWith("CBP-2026-"));
        assertEquals(CertificateType.PARTICIPATION, response.certificateType());
        assertEquals(CertificateStatus.GENERATED, response.status());

        verify(notificationEventPublisher).publish(any(CertificateGeneratedEvent.class));
    }

    @Test
    @DisplayName("2. Payment failure prevents certificate generation")
    void unpaidStudentCannotGetCertificate() {
        registration.setRegistrationStatus(RegistrationStatus.PAYMENT_PENDING);
        cbpRegistrationRepository.save(registration);

        assertThrows(IllegalStateException.class, () ->
                certificateService.generateCertificateForStudent("2024cert001")
        );
    }

    @Test
    @DisplayName("3. Attendance below threshold prevents certificate generation")
    void lowAttendanceStudentCannotGetCertificate() {
        when(attendanceQueryService.getStudentAttendanceSummary("2024cert001"))
                .thenReturn(new StudentAttendanceSummaryResponse("2024cert001", 10, 5, 50.0, new ArrayList<>()));

        assertThrows(IllegalStateException.class, () ->
                certificateService.generateCertificateForStudent("2024cert001")
        );
    }

    @Test
    @DisplayName("4. Duplicate certificate returns existing certificate")
    void duplicateCertificateReturnsExisting() {
        when(attendanceQueryService.getStudentAttendanceSummary("2024cert001"))
                .thenReturn(new StudentAttendanceSummaryResponse("2024cert001", 10, 8, 80.0, new ArrayList<>()));

        CertificateResponse first = certificateService.generateCertificateForStudent("2024cert001");
        CertificateResponse second = certificateService.generateCertificateForStudent("2024cert001");

        assertEquals(first.certificateNumber(), second.certificateNumber());
        assertEquals(1, certificateRepository.count());
    }

    @Test
    @DisplayName("5. Certificate PDF bytes generation works")
    void pdfBytesGenerationWorks() {
        when(attendanceQueryService.getStudentAttendanceSummary("2024cert001"))
                .thenReturn(new StudentAttendanceSummaryResponse("2024cert001", 10, 8, 80.0, new ArrayList<>()));

        certificateService.generateCertificateForStudent("2024cert001");
        byte[] pdfBytes = certificateService.getStudentCertificatePdfBytes("2024cert001");

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
        assertEquals((byte) '%', pdfBytes[0]);
        assertEquals((byte) 'P', pdfBytes[1]);
        assertEquals((byte) 'D', pdfBytes[2]);
        assertEquals((byte) 'F', pdfBytes[3]);
    }
}

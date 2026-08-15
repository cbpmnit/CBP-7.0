package com.cbp7.program.certificate;

import com.cbp7.program.attendance.record.dto.response.StudentAttendanceSummaryResponse;
import com.cbp7.program.attendance.record.service.AttendanceQueryService;
import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.program.registration.entity.RegistrationStatus;
import com.cbp7.program.registration.repository.CbpRegistrationRepository;
import com.cbp7.program.certificate.dto.response.CertificateResponse;
import com.cbp7.program.certificate.entity.CertificateStatus;
import com.cbp7.program.certificate.entity.CertificateType;
import com.cbp7.program.certificate.repository.CertificateRepository;
import com.cbp7.program.certificate.service.CertificateService;
import com.cbp7.platform.notification.events.CertificateGeneratedEvent;
import com.cbp7.platform.notification.events.NotificationEventPublisher;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.identity.profile.entity.Gender;
import com.cbp7.identity.profile.entity.ProgramLevel;
import com.cbp7.identity.profile.entity.StudentType;
import com.cbp7.identity.profile.entity.UserProfile;
import com.cbp7.identity.profile.repository.UserProfileRepository;
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
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS identity; CREATE SCHEMA IF NOT EXISTS program; CREATE SCHEMA IF NOT EXISTS platform; CREATE SCHEMA IF NOT EXISTS registration;"
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
                .programLevel(ProgramLevel.UNDERGRADUATE)
                .department("Computer Science and Engineering")
                .year(4)
                .studentType(StudentType.HOSTELLER)
                .hostelNumber("H1")
                .hosteller(true)
                .roomNumber("H-101")
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
                        .programLevel("UNDERGRADUATE")
                        .department("Computer Science and Engineering")
                        .year(4)
                        .studentType("HOSTELLER")
                        .hostelNumber("H1")
                        .hosteller(true)
                        .roomNumber("H-101")
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

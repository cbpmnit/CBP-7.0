package com.cbp7.program.attendance.qr.service;

import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.program.attendance.qr.AttendanceQrMapper;
import com.cbp7.program.attendance.qr.dto.request.BatchQrGenerationRequest;
import com.cbp7.program.attendance.qr.dto.response.BatchQrGenerationResponse;
import com.cbp7.program.attendance.qr.entity.AttendanceQrCode;
import com.cbp7.program.attendance.qr.entity.QrGenerationMode;
import com.cbp7.program.attendance.qr.generator.AttendanceQrTokenGenerator;
import com.cbp7.program.attendance.qr.generator.QrImageGenerator;
import com.cbp7.program.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.program.attendance.qr.service.impl.AttendanceQrServiceImpl;
import com.cbp7.program.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.program.attendance.session.entity.AttendanceSession;
import com.cbp7.program.attendance.session.entity.SessionStatus;
import com.cbp7.program.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.program.registration.repository.CbpRegistrationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceQrServiceTest {

    @Mock
    private AttendanceQrRepository attendanceQrRepository;

    @Mock
    private AttendanceRecordRepository attendanceRecordRepository;

    @Mock
    private AttendanceSessionRepository sessionRepository;

    @Mock
    private CbpRegistrationRepository cbpRegistrationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private QrImageGenerator qrImageGenerator;

    @Mock
    private AttendanceQrMapper attendanceQrMapper;

    @Mock
    private AttendanceQrTokenGenerator tokenGenerator;

    @Mock
    private Environment env;

    @InjectMocks
    private AttendanceQrServiceImpl attendanceQrService;

    private UUID sessionId;
    private AttendanceSession activeSession;

    @BeforeEach
    void setUp() {
        sessionId = UUID.randomUUID();
        activeSession = AttendanceSession.builder()
                .id(sessionId)
                .dayNumber(1)
                .title("Workshop Day 1")
                .status(SessionStatus.ACTIVE)
                .build();

        lenient().when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(activeSession));
        lenient().when(tokenGenerator.calculateExpiry(any())).thenReturn(LocalDateTime.now().plusHours(12));
    }

    @Test
    @DisplayName("Scenario 1: 100 students registered, 80 have QR, 20 missing -> MISSING_ONLY generates exactly 20")
    void testMissingOnlyGenerationMode() {
        List<CbpRegistration> registrations = new ArrayList<>();
        Set<String> activeQrSet = new HashSet<>();

        for (int i = 1; i <= 100; i++) {
            String studentId = "2024uch" + String.format("%04d", i);
            registrations.add(CbpRegistration.builder().studentId(studentId).build());
            if (i <= 80) {
                activeQrSet.add(studentId);
            }
        }

        when(cbpRegistrationRepository.findAll()).thenReturn(registrations);
        when(userRepository.findAll()).thenReturn(List.of());
        when(attendanceRecordRepository.findAttendedStudentIdsForSession(sessionId)).thenReturn(Set.of());
        when(attendanceQrRepository.findActiveStudentIdsForSession(sessionId)).thenReturn(activeQrSet);

        BatchQrGenerationRequest request = new BatchQrGenerationRequest(sessionId, QrGenerationMode.MISSING_ONLY, null);
        BatchQrGenerationResponse response = attendanceQrService.generateStudentQrsForSession(request);

        assertThat(response.totalStudents()).isEqualTo(100);
        assertThat(response.generatedCount()).isEqualTo(20);
        assertThat(response.alreadyHasQrCount()).isEqualTo(80);
        assertThat(response.alreadyAttendedCount()).isEqualTo(0);

        verify(attendanceQrRepository, times(20)).save(any(AttendanceQrCode.class));
    }

    @Test
    @DisplayName("Scenario 2: Student already attended -> Skipped during FORCE_REGENERATE")
    void testAttendanceProtectionRuleDuringRegeneration() {
        CbpRegistration studentA = CbpRegistration.builder().studentId("student_a").build();
        CbpRegistration studentB = CbpRegistration.builder().studentId("student_b").build();

        when(cbpRegistrationRepository.findAll()).thenReturn(List.of(studentA, studentB));
        when(userRepository.findAll()).thenReturn(List.of());

        // Student A has already marked attendance PRESENT
        when(attendanceRecordRepository.findAttendedStudentIdsForSession(sessionId)).thenReturn(Set.of("student_a"));
        when(attendanceQrRepository.findActiveStudentIdsForSession(sessionId)).thenReturn(Set.of("student_a", "student_b"));
        when(attendanceQrRepository.findBySessionIdAndStudentIdIgnoreCase(eq(sessionId), eq("student_b")))
                .thenReturn(List.of(AttendanceQrCode.builder().sessionId(sessionId).studentId("student_b").active(true).build()));

        BatchQrGenerationRequest request = new BatchQrGenerationRequest(sessionId, QrGenerationMode.FORCE_REGENERATE, null);
        BatchQrGenerationResponse response = attendanceQrService.generateStudentQrsForSession(request);

        assertThat(response.generatedCount()).isEqualTo(1); // Only Student B generated
        assertThat(response.alreadyAttendedCount()).isEqualTo(1); // Student A protected & skipped
        assertThat(response.skippedCount()).isEqualTo(1);

        verify(attendanceQrRepository, times(1)).save(argThat(qr -> qr.getStudentId().equals("student_b") && qr.isActive()));
    }

    @Test
    @DisplayName("Scenario 3: Admin selects specific students -> SELECTED_STUDENTS mode generates only for selected")
    void testSelectedStudentsGenerationMode() {
        BatchQrGenerationRequest request = new BatchQrGenerationRequest(
                sessionId,
                QrGenerationMode.SELECTED_STUDENTS,
                Set.of("2024UCH2503", "2024UCH2504")
        );

        when(attendanceRecordRepository.findAttendedStudentIdsForSession(sessionId)).thenReturn(Set.of());
        when(attendanceQrRepository.findActiveStudentIdsForSession(sessionId)).thenReturn(Set.of());

        BatchQrGenerationResponse response = attendanceQrService.generateStudentQrsForSession(request);

        assertThat(response.totalStudents()).isEqualTo(2);
        assertThat(response.generatedCount()).isEqualTo(2);
        verify(attendanceQrRepository, times(2)).save(any(AttendanceQrCode.class));
    }

    @Test
    @DisplayName("Scenario 4: Force regenerate selected student -> Old QR deactivated, new QR generated")
    void testForceRegenerateSelectedStudent() {
        AttendanceQrCode oldQr = AttendanceQrCode.builder().sessionId(sessionId).studentId("2024uch2503").active(true).build();

        when(attendanceRecordRepository.findAttendedStudentIdsForSession(sessionId)).thenReturn(Set.of());
        when(attendanceQrRepository.findActiveStudentIdsForSession(sessionId)).thenReturn(Set.of("2024uch2503"));
        when(attendanceQrRepository.findBySessionIdAndStudentIdIgnoreCase(sessionId, "2024uch2503")).thenReturn(List.of(oldQr));

        BatchQrGenerationRequest request = new BatchQrGenerationRequest(
                sessionId,
                QrGenerationMode.FORCE_REGENERATE,
                Set.of("2024UCH2503")
        );

        BatchQrGenerationResponse response = attendanceQrService.generateStudentQrsForSession(request);

        assertThat(response.generatedCount()).isEqualTo(1);
        assertThat(oldQr.isActive()).isFalse(); // Old token deactivated
        verify(attendanceQrRepository, times(1)).save(oldQr);
        verify(attendanceQrRepository, times(1)).save(argThat(qr -> qr.getStudentId().equals("2024uch2503") && qr.isActive()));
    }

    @Test
    @DisplayName("Scenario 5: Re-running MISSING_ONLY on existing QRs -> Zero duplicate active QR passes")
    void testDuplicateGenerationPrevention() {
        CbpRegistration studentA = CbpRegistration.builder().studentId("student_a").build();
        when(cbpRegistrationRepository.findAll()).thenReturn(List.of(studentA));
        when(userRepository.findAll()).thenReturn(List.of());

        when(attendanceRecordRepository.findAttendedStudentIdsForSession(sessionId)).thenReturn(Set.of());
        when(attendanceQrRepository.findActiveStudentIdsForSession(sessionId)).thenReturn(Set.of("student_a"));

        BatchQrGenerationRequest request = new BatchQrGenerationRequest(sessionId, QrGenerationMode.MISSING_ONLY, null);
        BatchQrGenerationResponse response = attendanceQrService.generateStudentQrsForSession(request);

        assertThat(response.generatedCount()).isEqualTo(0);
        assertThat(response.alreadyHasQrCount()).isEqualTo(1);
        verify(attendanceQrRepository, never()).save(any(AttendanceQrCode.class));
    }
}

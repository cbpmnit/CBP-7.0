package com.cbp7.attendance.qr;

import com.cbp7.attendance.qr.dto.AttendanceQrResponse;
import com.cbp7.attendance.qr.entity.AttendanceQrCode;
import com.cbp7.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.attendance.qr.service.AttendanceQrService;
import com.cbp7.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS cbp; CREATE SCHEMA IF NOT EXISTS profile; CREATE SCHEMA IF NOT EXISTS payment; CREATE SCHEMA IF NOT EXISTS notification; CREATE SCHEMA IF NOT EXISTS attendance;"
})
class AttendanceQrServiceTest {

    @Autowired
    private AttendanceQrService attendanceQrService;

    @Autowired
    private AttendanceQrRepository attendanceQrRepository;

    @BeforeEach
    void setUp() {
        attendanceQrRepository.deleteAll();
    }

    @Test
    @DisplayName("1. Token generation creates valid CBP_ATTENDANCE_ token")
    void generateQrCreatesValidToken() {
        String studentId = "2024student001";

        AttendanceQrCode qrCode = attendanceQrService.generateQrForStudent(studentId);

        assertNotNull(qrCode.getId());
        assertNotNull(qrCode.getToken());
        assertTrue(qrCode.getToken().startsWith("CBP_ATTENDANCE_"));
        assertEquals(studentId, qrCode.getStudentId());
        assertTrue(qrCode.isActive());
    }

    @Test
    @DisplayName("2. QR persistence saves record in attendance schema")
    void generateQrPersistsRecord() {
        String studentId = "2024student002";

        AttendanceQrCode saved = attendanceQrService.generateQrForStudent(studentId);

        assertTrue(attendanceQrRepository.findById(saved.getId()).isPresent());
        assertTrue(attendanceQrRepository.findByStudentId(studentId).isPresent());
    }

    @Test
    @DisplayName("3. Duplicate prevention returns existing active QR")
    void generateQrPreventsDuplicates() {
        String studentId = "2024student003";

        AttendanceQrCode first = attendanceQrService.generateQrForStudent(studentId);
        AttendanceQrCode second = attendanceQrService.generateQrForStudent(studentId);

        assertEquals(first.getId(), second.getId());
        assertEquals(first.getToken(), second.getToken());
        assertEquals(1, attendanceQrRepository.count());
    }

    @Test
    @DisplayName("4. Image generation returns valid PNG bytes")
    void generateQrImageReturnsValidBytes() {
        String studentId = "2024student004";
        AttendanceQrCode qrCode = attendanceQrService.generateQrForStudent(studentId);

        byte[] pngBytes = attendanceQrService.generateQrImage(qrCode.getToken());

        assertNotNull(pngBytes);
        assertTrue(pngBytes.length > 0);
        assertEquals((byte) 0x89, pngBytes[0]);
        assertEquals((byte) 'P', pngBytes[1]);
        assertEquals((byte) 'N', pngBytes[2]);
        assertEquals((byte) 'G', pngBytes[3]);
    }

    @Test
    @DisplayName("5. Student QR retrieval returns AttendanceQrResponse with Base64 image")
    void getStudentQrReturnsBase64Image() {
        String studentId = "2024student005";
        attendanceQrService.generateQrForStudent(studentId);

        AttendanceQrResponse response = attendanceQrService.getStudentQr(studentId);

        assertNotNull(response);
        assertNotNull(response.token());
        assertTrue(response.token().startsWith("CBP_ATTENDANCE_"));
        assertNotNull(response.qrImage());
        assertTrue(response.qrImage().startsWith("data:image/png;base64,"));
    }

    @Test
    @DisplayName("6. Missing student or empty ID throws appropriate exception")
    void invalidStudentHandlingThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> attendanceQrService.generateQrForStudent(null));
        assertThrows(IllegalArgumentException.class, () -> attendanceQrService.generateQrForStudent("  "));

        assertThrows(ResourceNotFoundException.class, () -> attendanceQrService.getStudentQr("nonexistent_student"));
    }
}

package com.cbp7.program.attendance.record.service;

import com.cbp7.program.attendance.qr.dto.response.EligibleStudentQrResponse;
import com.cbp7.program.attendance.record.dto.common.*;
import com.cbp7.program.attendance.record.dto.response.*;
import com.cbp7.program.attendance.record.entity.AttendanceStatus;
import com.cbp7.program.attendance.session.dto.response.SessionSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface AttendanceQueryService {
    SessionSummaryResponse getSessionSummary(UUID sessionId);
    Page<StudentSessionRecordDto> getSessionRecordsPaginated(UUID sessionId, String search, AttendanceStatus status, Pageable pageable);
    Page<EligibleStudentQrResponse> getEligibleStudentsForSessionQr(UUID sessionId, String search, String qrStatusFilter, Pageable pageable);
    DailyAttendanceReportResponse getAttendanceByDate(LocalDate date);
    StudentAttendanceSummaryResponse getStudentAttendanceSummary(String studentId);
    AdminAttendanceSummaryResponse getAdminAttendanceSummary();
    byte[] exportAttendanceCsv(String search, UUID sessionId, LocalDate date);
    StudentAttendanceProfileResponse getStudentAttendanceProfile(String studentId);
    UserAttendanceProfileResponse getUserAttendanceProfile(String userId);
}

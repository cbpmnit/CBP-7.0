package com.cbp7.attendance.record.service;

import com.cbp7.attendance.record.dto.response.AttendanceRecordResponse;
import com.cbp7.attendance.record.dto.response.ScanAttendanceResponse;

import java.util.List;
import java.util.UUID;

public interface AttendanceService {
    ScanAttendanceResponse scanAttendanceQr(String qrToken, String volunteerId);
    AttendanceRecordResponse markAttendanceViaQr(String qrToken, String studentId, String volunteerId);
    AttendanceRecordResponse recordStudentAttendance(UUID sessionId, String studentId, String markedBy);
    List<AttendanceRecordResponse> getSessionAttendanceRecords(UUID sessionId);
    List<AttendanceRecordResponse> getStudentAttendanceHistory(String studentId);
}

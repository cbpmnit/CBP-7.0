package com.cbp7.program.attendance.record.mapper;

import com.cbp7.program.attendance.record.dto.common.MarkedByInfo;
import com.cbp7.program.attendance.record.dto.common.StudentInfo;
import com.cbp7.program.attendance.record.dto.common.StudentSessionRecordDto;
import com.cbp7.program.attendance.record.dto.response.AttendanceRecordResponse;
import com.cbp7.program.attendance.record.dto.response.ScanAttendanceResponse;
import com.cbp7.program.attendance.record.entity.AttendanceRecord;
import com.cbp7.program.attendance.session.entity.AttendanceSession;
import com.cbp7.identity.auth.entity.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AttendanceMapper {

    public AttendanceRecordResponse toRecordResponse(AttendanceRecord record) {
        if (record == null) {
            return null;
        }
        return new AttendanceRecordResponse(
                record.getId(),
                record.getSessionId(),
                record.getStudentId(),
                record.getMarkedBy(),
                record.getMarkedAt(),
                record.getStatus()
        );
    }

    public ScanAttendanceResponse toScanResponse(
            String studentName,
            String studentId,
            String sessionDescription,
            LocalDateTime now
    ) {
        return new ScanAttendanceResponse(
                true,
                studentName,
                studentId,
                sessionDescription,
                now
        );
    }

    public StudentSessionRecordDto toStudentSessionRecordDto(
            AttendanceRecord record,
            User studentUser,
            AttendanceSession session,
            MarkedByInfo markedByInfo
    ) {
        String studentName = studentUser != null && studentUser.getName() != null
                ? studentUser.getName()
                : record.getStudentId();
        String email = studentUser != null ? studentUser.getEmail() : "";
        String userIdStr = studentUser != null && studentUser.getId() != null ? studentUser.getId().toString() : "";

        StudentInfo studentInfo = new StudentInfo(userIdStr, studentName, record.getStudentId(), email);

        return new StudentSessionRecordDto(
                record.getStudentId(),
                studentName,
                email,
                record.getStatus(),
                record.getMarkedAt(),
                markedByInfo.name(),
                studentInfo,
                markedByInfo
        );
    }
}

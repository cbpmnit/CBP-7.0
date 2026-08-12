package com.cbp7.attendance.record.mapper;

import com.cbp7.attendance.record.dto.common.MarkedByInfo;
import com.cbp7.attendance.record.dto.common.StudentInfo;
import com.cbp7.attendance.record.dto.common.StudentSessionRecordDto;
import com.cbp7.attendance.record.dto.response.ScanAttendanceResponse;
import com.cbp7.attendance.record.entity.AttendanceRecord;
import com.cbp7.attendance.session.entity.AttendanceSession;
import com.cbp7.auth.entity.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AttendanceMapper {

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

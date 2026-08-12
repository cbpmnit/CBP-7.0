package com.cbp7.program.attendance.record.helper;

import com.cbp7.program.attendance.record.entity.AttendanceRecord;
import com.cbp7.program.attendance.session.entity.AttendanceSession;
import com.cbp7.common.util.CsvExportUtil;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class AttendanceCsvExporter {

    private static final List<String> HEADERS = List.of(
            "Student ID", "Student Name", "Session Title", "Day Number",
            "Session Date", "Attendance Status", "Marked At", "Marked By"
    );

    public byte[] exportAttendanceCsv(
            List<AttendanceRecord> records,
            Map<UUID, AttendanceSession> sessionMap,
            Map<String, String> userNameMap,
            String search,
            UUID sessionId,
            LocalDate date
    ) {
        String q = search != null ? search.trim().toLowerCase() : "";

        List<List<String>> rows = new ArrayList<>();
        for (AttendanceRecord r : records) {
            AttendanceSession session = sessionMap.get(r.getSessionId());
            if (sessionId != null && !sessionId.equals(r.getSessionId())) {
                continue;
            }
            if (date != null && (session == null || !date.equals(session.getSessionDate()))) {
                continue;
            }

            String sid = r.getStudentId() != null ? r.getStudentId() : "";
            String sName = userNameMap.getOrDefault(sid.toLowerCase(), sid);

            if (!q.isEmpty()) {
                boolean match = sid.toLowerCase().contains(q) || sName.toLowerCase().contains(q);
                if (!match) {
                    continue;
                }
            }

            rows.add(List.of(
                    sid,
                    sName,
                    session != null ? session.getTitle() : "Session",
                    session != null ? String.valueOf(session.getDayNumber()) : "-",
                    session != null && session.getSessionDate() != null ? session.getSessionDate().toString() : "-",
                    r.getStatus() != null ? r.getStatus().name() : "PRESENT",
                    r.getMarkedAt() != null ? r.getMarkedAt().toString() : "-",
                    r.getMarkedBy() != null ? r.getMarkedBy() : "Admin/Scanner"
            ));
        }

        return CsvExportUtil.generateCsv(HEADERS, rows);
    }
}

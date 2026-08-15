package com.cbp7.platform.admin.student.helper;

import com.cbp7.platform.admin.student.dto.response.AdminStudentListItemResponse;
import com.cbp7.common.util.CsvExportUtil;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class AdminStudentCsvExporter {

    private static final List<String> HEADERS = List.of(
            "Student ID", "Full Name", "Email", "Phone",
            "Program Level", "Department", "Year", "Registration Status",
            "Payment Status", "Attendance (%)", "Profile Completion (%)"
    );

    public byte[] exportStudentsCsv(List<AdminStudentListItemResponse> list) {
        List<List<String>> rows = new ArrayList<>();
        for (AdminStudentListItemResponse s : list) {
            rows.add(List.of(
                    s.studentId() != null ? s.studentId() : "",
                    s.name() != null ? s.name() : "",
                    s.email() != null ? s.email() : "",
                    s.phone() != null ? s.phone() : "",
                    s.programLevel() != null ? s.programLevel() : "",
                    s.department() != null ? s.department() : "",
                    s.year() != null ? s.year() : "",
                    s.registrationStatus() != null ? s.registrationStatus() : "",
                    s.paymentStatus() != null ? s.paymentStatus() : "",
                    String.format("%.1f", s.attendancePercentage()),
                    String.valueOf(s.profileCompletion())
            ));
        }

        return CsvExportUtil.generateCsv(HEADERS, rows);
    }
}

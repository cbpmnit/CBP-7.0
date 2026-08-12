package com.cbp7.volunteer.helper;

import com.cbp7.common.util.CsvExportUtil;
import com.cbp7.volunteer.dto.response.VolunteerListItemResponse;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class VolunteerCsvExporter {

    private static final List<String> HEADERS = List.of(
            "Volunteer ID / Student ID", "Name", "Email", "Role",
            "Status", "Assigned Permissions", "Registered / Invited Date"
    );

    public byte[] exportVolunteersCsv(List<VolunteerListItemResponse> list, String search, String statusFilter) {
        String q = search != null ? search.trim().toLowerCase() : "";
        String sFilter = statusFilter != null && !statusFilter.isBlank() && !"ALL".equalsIgnoreCase(statusFilter)
                ? statusFilter.trim().toUpperCase() : null;

        List<List<String>> rows = new ArrayList<>();
        for (VolunteerListItemResponse v : list) {
            if (!q.isEmpty()) {
                boolean match = (v.name() != null && v.name().toLowerCase().contains(q))
                        || (v.email() != null && v.email().toLowerCase().contains(q))
                        || (v.id() != null && v.id().toLowerCase().contains(q));
                if (!match) continue;
            }

            if (sFilter != null && !sFilter.equalsIgnoreCase(v.status())) {
                continue;
            }

            String permsStr = v.permissions() != null ? String.join("; ", v.permissions()) : "NONE";

            rows.add(List.of(
                    v.id() != null ? v.id() : "",
                    v.name() != null ? v.name() : "",
                    v.email() != null ? v.email() : "",
                    v.role() != null ? v.role() : "ROLE_VOLUNTEER",
                    v.status() != null ? v.status() : "ACTIVE",
                    permsStr,
                    v.createdAt() != null ? v.createdAt().toString() : ""
            ));
        }

        return CsvExportUtil.generateCsv(HEADERS, rows);
    }
}

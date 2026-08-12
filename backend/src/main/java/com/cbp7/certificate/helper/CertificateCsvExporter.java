package com.cbp7.certificate.helper;

import com.cbp7.certificate.entity.Certificate;
import com.cbp7.common.util.CsvExportUtil;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class CertificateCsvExporter {

    private static final List<String> HEADERS = List.of(
            "Certificate Number", "Student ID", "Student Name",
            "Certificate Type", "Status", "Issue Date"
    );

    public byte[] exportCertificatesCsv(List<Certificate> certificates, Map<String, String> userNames) {
        List<List<String>> rows = new ArrayList<>();
        for (Certificate cert : certificates) {
            String sid = cert.getStudentId() != null ? cert.getStudentId() : "";
            String sName = userNames.getOrDefault(sid.toLowerCase(), sid);

            rows.add(List.of(
                    cert.getCertificateNumber() != null ? cert.getCertificateNumber() : "",
                    sid,
                    sName,
                    cert.getCertificateType() != null ? cert.getCertificateType().name() : "PARTICIPATION",
                    cert.getStatus() != null ? cert.getStatus().name() : "GENERATED",
                    cert.getGeneratedAt() != null ? cert.getGeneratedAt().toString() : ""
            ));
        }

        return CsvExportUtil.generateCsv(HEADERS, rows);
    }
}

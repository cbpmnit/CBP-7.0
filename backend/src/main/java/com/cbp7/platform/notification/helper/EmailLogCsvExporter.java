package com.cbp7.platform.notification.helper;

import com.cbp7.common.util.CsvExportUtil;
import com.cbp7.platform.notification.entity.EmailLog;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class EmailLogCsvExporter {

    private static final List<String> HEADERS = List.of(
            "Log ID", "Operation ID", "Recipient", "Template Name",
            "Status", "Dispatched At", "Error / Detail"
    );

    public byte[] exportEmailLogsCsv(List<EmailLog> allLogs) {
        List<List<String>> rows = new ArrayList<>();
        for (EmailLog log : allLogs) {
            rows.add(List.of(
                    log.getId() != null ? log.getId().toString() : "",
                    log.getOperationId() != null ? log.getOperationId().toString() : "",
                    log.getRecipient() != null ? log.getRecipient() : "",
                    log.getTemplateName() != null ? log.getTemplateName() : "",
                    log.getStatus() != null ? log.getStatus() : "",
                    log.getCreatedAt() != null ? log.getCreatedAt().toString() : "",
                    log.getErrorMessage() != null ? log.getErrorMessage() : ""
            ));
        }

        return CsvExportUtil.generateCsv(HEADERS, rows);
    }
}

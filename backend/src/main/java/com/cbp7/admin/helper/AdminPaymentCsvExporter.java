package com.cbp7.admin.helper;

import com.cbp7.admin.dto.response.AdminPaymentOverviewResponse;
import com.cbp7.common.util.CsvExportUtil;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class AdminPaymentCsvExporter {

    private static final List<String> HEADERS = List.of(
            "Student ID", "Student Name", "Amount (INR)", "Transaction ID",
            "Registration Ref", "Payment Status", "Payment Date"
    );

    public byte[] exportPaymentsCsv(List<AdminPaymentOverviewResponse.PaymentTransactionDto> list, String search, String paymentStatus) {
        String q = search != null ? search.trim().toLowerCase() : "";
        String statusFilter = paymentStatus != null && !paymentStatus.isBlank() && !"ALL".equalsIgnoreCase(paymentStatus)
                ? paymentStatus.trim().toUpperCase() : null;

        List<List<String>> rows = new ArrayList<>();
        for (AdminPaymentOverviewResponse.PaymentTransactionDto tx : list) {
            if (!q.isEmpty()) {
                boolean match = (tx.studentName() != null && tx.studentName().toLowerCase().contains(q))
                        || (tx.studentId() != null && tx.studentId().toLowerCase().contains(q))
                        || (tx.transactionId() != null && tx.transactionId().toLowerCase().contains(q))
                        || (tx.registrationId() != null && tx.registrationId().toLowerCase().contains(q));
                if (!match) continue;
            }

            if (statusFilter != null && !statusFilter.equalsIgnoreCase(tx.paymentStatus())) {
                continue;
            }

            rows.add(List.of(
                    tx.studentId() != null ? tx.studentId() : "",
                    tx.studentName() != null ? tx.studentName() : "",
                    String.format("%.2f", tx.amount()),
                    tx.transactionId() != null ? tx.transactionId() : "",
                    tx.registrationId() != null ? tx.registrationId() : "",
                    tx.paymentStatus() != null ? tx.paymentStatus() : "",
                    tx.paymentTime() != null ? tx.paymentTime().toString() : ""
            ));
        }

        return CsvExportUtil.generateCsv(HEADERS, rows);
    }
}

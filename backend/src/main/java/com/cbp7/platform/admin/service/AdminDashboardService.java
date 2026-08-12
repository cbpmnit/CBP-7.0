package com.cbp7.platform.admin.service;

import com.cbp7.platform.admin.dto.response.AdminDashboardSummaryResponse;
import com.cbp7.platform.admin.dto.response.AdminPaymentOverviewResponse;
import com.cbp7.platform.admin.dto.response.AdminStudentDetailResponse;

import java.util.List;

public interface AdminDashboardService {
    AdminDashboardSummaryResponse getSummary();
    List<AdminStudentDetailResponse> searchStudents(String search);
    AdminPaymentOverviewResponse getPaymentOverview();
    byte[] exportPaymentsCsv(String search, String paymentStatus);
}

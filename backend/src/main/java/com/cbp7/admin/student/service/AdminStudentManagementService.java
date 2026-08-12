package com.cbp7.admin.student.service;

import com.cbp7.admin.student.dto.common.*;
import com.cbp7.admin.student.dto.request.*;
import com.cbp7.admin.student.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminStudentManagementService {
    Page<AdminStudentListItemResponse> getStudentsPaginated(
            String search,
            String registrationStatus,
            String paymentStatus,
            String attendanceStatus,
            String profileStatus,
            Pageable pageable
    );
    AdminFullStudentDetailResponse getStudentFullDetail(String studentId);
    AdminFullStudentDetailResponse updateStudentProfile(String studentId, UpdateStudentProfileRequest request);
    byte[] generateStudentPdf(String studentId);
    byte[] exportStudentsCsv(String search, String registrationStatus, String paymentStatus, String attendanceStatus, String profileStatus);
    AdminDashboardStatsResponse getDashboardSummary();
    AdminPreferencesDto getAdminPreferences(String adminId);
    AdminPreferencesDto saveAdminPreferences(String adminId, AdminPreferencesDto dto);
}

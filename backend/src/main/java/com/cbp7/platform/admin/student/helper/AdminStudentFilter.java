package com.cbp7.platform.admin.student.helper;

import com.cbp7.platform.admin.student.dto.response.AdminStudentListItemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class AdminStudentFilter {

    public Page<AdminStudentListItemResponse> filterAndPaginate(
            List<AdminStudentListItemResponse> allItems,
            String search,
            String registrationStatus,
            String paymentStatus,
            String attendanceStatus,
            String profileStatus,
            Pageable pageable
    ) {
        String q = search != null && !search.isBlank() ? search.trim().toLowerCase() : null;
        String regFilter = registrationStatus != null && !registrationStatus.isBlank() && !"ALL".equalsIgnoreCase(registrationStatus)
                ? registrationStatus.trim() : null;
        String payFilter = paymentStatus != null && !paymentStatus.isBlank() && !"ALL".equalsIgnoreCase(paymentStatus)
                ? paymentStatus.trim() : null;
        String attFilter = attendanceStatus != null && !attendanceStatus.isBlank() && !"ALL".equalsIgnoreCase(attendanceStatus)
                ? attendanceStatus.trim() : null;
        String profFilter = profileStatus != null && !profileStatus.isBlank() && !"ALL".equalsIgnoreCase(profileStatus)
                ? profileStatus.trim() : null;

        List<AdminStudentListItemResponse> filtered = allItems.stream()
                .filter(item -> {
                    if (q != null) {
                        String sid = item.studentId() != null ? item.studentId().toLowerCase() : "";
                        String name = item.name() != null ? item.name().toLowerCase() : "";
                        String email = item.email() != null ? item.email().toLowerCase() : "";
                        String phone = item.phone() != null ? item.phone().toLowerCase() : "";
                        if (!sid.contains(q) && !name.contains(q) && !email.contains(q) && !phone.contains(q)) {
                            return false;
                        }
                    }

                    if (regFilter != null && !regFilter.equalsIgnoreCase(item.registrationStatus())) {
                        return false;
                    }

                    if (payFilter != null && !payFilter.equalsIgnoreCase(item.paymentStatus())) {
                        return false;
                    }

                    boolean isEligible = item.attendancePercentage() >= 75.0;
                    if (attFilter != null) {
                        if ("ELIGIBLE".equalsIgnoreCase(attFilter) && !isEligible) return false;
                        if ("NOT_ELIGIBLE".equalsIgnoreCase(attFilter) && isEligible) return false;
                    }

                    boolean isComplete = item.profileCompletion() >= 75;
                    if (profFilter != null) {
                        if ("COMPLETED".equalsIgnoreCase(profFilter) && !isComplete) return false;
                        if ("INCOMPLETE".equalsIgnoreCase(profFilter) && isComplete) return false;
                    }

                    return true;
                })
                .sorted(Comparator.comparing(AdminStudentListItemResponse::createdAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        if (pageable.isUnpaged()) {
            return new PageImpl<>(filtered);
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtered.size());
        List<AdminStudentListItemResponse> pageContent = start > filtered.size() ? List.of() : filtered.subList(start, end);

        return new PageImpl<>(pageContent, pageable, filtered.size());
    }
}

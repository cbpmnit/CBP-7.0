package com.cbp7.platform.notification;

import com.cbp7.platform.admin.student.dto.response.AdminStudentListItemResponse;
import com.cbp7.platform.admin.student.service.AdminStudentManagementService;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.platform.notification.dto.request.CreateEmailOperationRequest;
import com.cbp7.program.attendance.qr.dto.response.EligibleStudentQrResponse;
import com.cbp7.program.attendance.record.service.AttendanceQueryService;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class EmailRecipientResolver {

    private final AdminStudentManagementService studentManagementService;
    private final UserRepository userRepository;
    private final AttendanceQueryService attendanceQueryService;

    public EmailRecipientResolver(
            AdminStudentManagementService studentManagementService,
            UserRepository userRepository,
            @Lazy AttendanceQueryService attendanceQueryService
    ) {
        this.studentManagementService = studentManagementService;
        this.userRepository = userRepository;
        this.attendanceQueryService = attendanceQueryService;
    }

    public List<String> resolveRecipients(CreateEmailOperationRequest request) {
        if (request == null) {
            return List.of();
        }

        String rType = request.recipientType() != null ? request.recipientType().toUpperCase() : "INDIVIDUAL";

        if ("INDIVIDUAL".equals(rType)) {
            return request.individualRecipients() != null ? request.individualRecipients() : List.of();
        }

        if ("PAID_STUDENTS".equals(rType)) {
            Page<AdminStudentListItemResponse> paid = studentManagementService.getStudentsPaginated(
                    null, null, "SUCCESS", null, null, Pageable.unpaged()
            );
            return paid.getContent().stream()
                    .map(AdminStudentListItemResponse::email)
                    .filter(e -> e != null && !e.isBlank())
                    .distinct()
                    .toList();
        }

        if ("ALL_STUDENTS".equals(rType)) {
            return userRepository.findAll().stream()
                    .map(User::getEmail)
                    .filter(e -> e != null && !e.isBlank())
                    .distinct()
                    .toList();
        }

        // Attendance session recipient resolution
        if ("QR_GENERATED".equals(rType) || "QR_MISSING".equals(rType) || "ATTENDED_STUDENTS".equals(rType) || "ABSENT_STUDENTS".equals(rType)) {
            UUID sessionId = null;
            if (request.filters() != null && !request.filters().isBlank()) {
                try {
                    sessionId = UUID.fromString(request.filters().trim());
                } catch (Exception ignored) {}
            }

            Page<EligibleStudentQrResponse> eligible = attendanceQueryService.getEligibleStudentsForSessionQr(
                    sessionId, null, "ALL", Pageable.unpaged()
            );

            return eligible.getContent().stream()
                    .filter(s -> {
                        if ("QR_GENERATED".equals(rType)) return "GENERATED".equalsIgnoreCase(s.qrStatus());
                        if ("QR_MISSING".equals(rType)) return "MISSING".equalsIgnoreCase(s.qrStatus());
                        if ("ATTENDED_STUDENTS".equals(rType)) return "PRESENT".equalsIgnoreCase(s.attendanceStatus());
                        if ("ABSENT_STUDENTS".equals(rType)) return !"PRESENT".equalsIgnoreCase(s.attendanceStatus());
                        return true;
                    })
                    .map(EligibleStudentQrResponse::email)
                    .filter(e -> e != null && !e.isBlank())
                    .distinct()
                    .toList();
        }

        if ("CUSTOM_FILTER".equals(rType)) {
            Page<AdminStudentListItemResponse> filtered = studentManagementService.getStudentsPaginated(
                    request.filters(), null, null, null, null, Pageable.unpaged()
            );
            return filtered.getContent().stream()
                    .map(AdminStudentListItemResponse::email)
                    .filter(e -> e != null && !e.isBlank())
                    .distinct()
                    .toList();
        }

        return List.of();
    }
}

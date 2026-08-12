package com.cbp7.platform.notification;

import com.cbp7.platform.admin.student.dto.response.AdminStudentListItemResponse;
import com.cbp7.platform.admin.student.service.AdminStudentManagementService;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.platform.notification.dto.request.CreateEmailOperationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class EmailRecipientResolver {

    private final AdminStudentManagementService studentManagementService;
    private final UserRepository userRepository;

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

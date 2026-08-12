package com.cbp7.platform.notification.resolver;

import com.cbp7.platform.admin.student.dto.response.AdminStudentListItemResponse;
import com.cbp7.platform.admin.student.service.AdminStudentManagementService;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.platform.notification.dto.request.CreateEmailOperationRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailRecipientResolverTest {

    @Mock
    private AdminStudentManagementService studentManagementService;

    @Mock
    private UserRepository userRepository;

    private EmailRecipientResolver resolver;

    @BeforeEach
    void setUp() {
        resolver = new EmailRecipientResolver(studentManagementService, userRepository);
    }

    @Test
    @DisplayName("resolveRecipients returns individual recipients list directly")
    void testResolveIndividualRecipients() {
        CreateEmailOperationRequest request = new CreateEmailOperationRequest(
                "Op1", UUID.randomUUID(), "INDIVIDUAL", null,
                List.of("a@mnit.ac.in", "b@mnit.ac.in"), "MANUAL", null, null
        );

        List<String> recipients = resolver.resolveRecipients(request);
        assertThat(recipients).containsExactly("a@mnit.ac.in", "b@mnit.ac.in");
    }

    @Test
    @DisplayName("resolveRecipients resolves all students from user repository")
    void testResolveAllStudents() {
        User u1 = User.builder().email("student1@mnit.ac.in").build();
        User u2 = User.builder().email("student2@mnit.ac.in").build();
        when(userRepository.findAll()).thenReturn(List.of(u1, u2));

        CreateEmailOperationRequest request = new CreateEmailOperationRequest(
                "Op2", UUID.randomUUID(), "ALL_STUDENTS", null,
                null, "MANUAL", null, null
        );

        List<String> recipients = resolver.resolveRecipients(request);
        assertThat(recipients).containsExactly("student1@mnit.ac.in", "student2@mnit.ac.in");
    }
}

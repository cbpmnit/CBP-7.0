package com.cbp7.platform.volunteer.helper;

import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VolunteerAccountProvisionerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private VolunteerAccountProvisioner provisioner;

    @BeforeEach
    void setUp() {
        provisioner = new VolunteerAccountProvisioner(userRepository, passwordEncoder);
    }

    @Test
    @DisplayName("createNewVolunteerUser creates user with unique student ID and encoded password")
    void testCreateNewVolunteerUser() {
        when(userRepository.existsByStudentId(anyString())).thenReturn(false);
        when(passwordEncoder.encode("plainPassword")).thenReturn("hashedPass");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User user = provisioner.createNewVolunteerUser("vol1@mnit.ac.in", "Vol One", Set.of("ATTENDANCE_SCAN"), "plainPassword");

        assertThat(user).isNotNull();
        assertThat(user.getEmail()).isEqualTo("vol1@mnit.ac.in");
        assertThat(user.getName()).isEqualTo("Vol One");
        assertThat(user.getPassword()).isEqualTo("hashedPass");
        assertThat(user.getRole()).isEqualTo(Role.ROLE_VOLUNTEER);
        assertThat(user.hasRole(Role.ROLE_VOLUNTEER)).isTrue();
        assertThat(user.getPermissions()).contains("ATTENDANCE_SCAN");
    }

    @Test
    @DisplayName("activateExistingUser preserves existing student role while adding volunteer role and permissions")
    void testActivateExistingUser() {
        User student = User.builder()
                .email("student@mnit.ac.in")
                .role(Role.ROLE_STUDENT)
                .roles(new HashSet<>(List.of(Role.ROLE_STUDENT)))
                .build();

        when(passwordEncoder.encode("newPass")).thenReturn("hashedNewPass");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User updated = provisioner.activateExistingUser(student, Set.of("PAYMENT_VIEW"), "newPass");

        assertThat(updated.getRole()).isEqualTo(Role.ROLE_VOLUNTEER);
        assertThat(updated.hasRole(Role.ROLE_VOLUNTEER)).isTrue();
        assertThat(updated.getPassword()).isEqualTo("hashedNewPass");
        assertThat(updated.getPermissions()).contains("PAYMENT_VIEW");
    }
}

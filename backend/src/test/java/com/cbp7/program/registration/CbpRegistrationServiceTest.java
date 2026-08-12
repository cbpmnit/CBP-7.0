package com.cbp7.program.registration;

import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.program.registration.dto.response.CbpRegistrationDetailResponse;
import com.cbp7.program.registration.dto.response.CbpRegistrationResponse;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.program.registration.entity.RegistrationStatus;
import com.cbp7.program.registration.repository.CbpRegistrationRepository;
import com.cbp7.program.registration.service.CbpRegistrationService;
import com.cbp7.common.exception.ForbiddenException;
import com.cbp7.common.exception.ProfileIncompleteException;
import com.cbp7.common.exception.RegistrationAlreadyExistsException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.common.exception.UnauthorizedException;
import com.cbp7.identity.profile.ProfileEligibilityValidator;
import com.cbp7.identity.profile.entity.Branch;
import com.cbp7.identity.profile.entity.Course;
import com.cbp7.identity.profile.entity.Gender;
import com.cbp7.identity.profile.entity.UserProfile;
import com.cbp7.identity.profile.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CbpRegistrationServiceTest {

    private CbpRegistrationRepository cbpRegistrationRepository;
    private UserProfileRepository userProfileRepository;
    private CbpRegistrationService cbpRegistrationService;
    private User studentUser;
    private User adminUser;
    private UserProfile completedProfile;

    @BeforeEach
    void setUp() {
        cbpRegistrationRepository = mock(CbpRegistrationRepository.class);
        userProfileRepository = mock(UserProfileRepository.class);
        cbpRegistrationService = new com.cbp7.program.registration.service.impl.CbpRegistrationServiceImpl(
                cbpRegistrationRepository,
                userProfileRepository,
                new com.cbp7.program.registration.CbpRegistrationValidator(new ProfileEligibilityValidator()),
                new com.cbp7.program.registration.CbpRegistrationMapper()
        );

        studentUser = User.builder()
                .studentId("2023ucp1234")
                .email("student@mnit.ac.in")
                .name("Parv Agrawal")
                .phoneNumber("9876543210")
                .role(Role.ROLE_STUDENT)
                .enabled(true)
                .build();
        studentUser.setId(UUID.randomUUID());

        adminUser = User.builder()
                .studentId("2023admin")
                .email("admin@mnit.ac.in")
                .name("Admin User")
                .role(Role.ROLE_ADMIN)
                .enabled(true)
                .build();
        adminUser.setId(UUID.randomUUID());

        completedProfile = UserProfile.builder()
                .user(studentUser)
                .firstName("Parv")
                .lastName("Agrawal")
                .gender(Gender.MALE)
                .dateOfBirth(LocalDate.of(2002, 5, 15))
                .phoneNumber("9876543210")
                .institute("MNIT Jaipur")
                .course(Course.BTECH)
                .branch(Branch.COMPUTER_SCIENCE_ENGINEERING)
                .year(3)
                .section("A")
                .hosteller(true)
                .roomNumber("H-101")
                .city("Jaipur")
                .state("Rajasthan")
                .build();
    }

    @Test
    void registerStudent_Success() {
        when(cbpRegistrationRepository.existsByUserStudentIdIgnoreCase(studentUser.getStudentId())).thenReturn(false);
        when(userProfileRepository.findByUserStudentIdIgnoreCase(studentUser.getStudentId())).thenReturn(Optional.of(completedProfile));
        when(cbpRegistrationRepository.count()).thenReturn(0L);
        when(cbpRegistrationRepository.save(any(CbpRegistration.class))).thenAnswer(i -> i.getArgument(0));

        CbpRegistrationResponse response = cbpRegistrationService.registerStudent(studentUser);

        assertNotNull(response);
        assertEquals("CBP7000001", response.registrationId());
        assertEquals(RegistrationStatus.PAYMENT_PENDING, response.registrationStatus());
        assertEquals("2023ucp1234", response.studentId());
        assertEquals("Parv", response.firstName());
        assertEquals("Agrawal", response.lastName());

        ArgumentCaptor<CbpRegistration> captor = ArgumentCaptor.forClass(CbpRegistration.class);
        verify(cbpRegistrationRepository).save(captor.capture());

        CbpRegistration saved = captor.getValue();
        assertEquals("CBP7000001", saved.getRegistrationId());
        assertEquals("2023ucp1234", saved.getStudentId());
        assertEquals("student@mnit.ac.in", saved.getEmail());
        assertEquals("Parv", saved.getFirstName());
        assertEquals("Agrawal", saved.getLastName());
        assertEquals("COMPUTER_SCIENCE_ENGINEERING", saved.getBranch());
        assertEquals(RegistrationStatus.PAYMENT_PENDING, saved.getRegistrationStatus());
    }

    @Test
    void registerStudent_DuplicateRegistration_ThrowsException() {
        when(cbpRegistrationRepository.existsByUserStudentIdIgnoreCase(studentUser.getStudentId())).thenReturn(true);

        assertThrows(RegistrationAlreadyExistsException.class, () -> cbpRegistrationService.registerStudent(studentUser));
    }

    @Test
    void registerStudent_ProfileMissing_ThrowsException() {
        when(cbpRegistrationRepository.existsByUserStudentIdIgnoreCase(studentUser.getStudentId())).thenReturn(false);
        when(userProfileRepository.findByUserStudentIdIgnoreCase(studentUser.getStudentId())).thenReturn(Optional.empty());

        assertThrows(ProfileIncompleteException.class, () -> cbpRegistrationService.registerStudent(studentUser));
    }

    @Test
    void registerStudent_ProfileIncomplete_ThrowsException() {
        UserProfile incomplete = UserProfile.builder()
                .firstName("Parv")
                .build();

        when(cbpRegistrationRepository.existsByUserStudentIdIgnoreCase(studentUser.getStudentId())).thenReturn(false);
        when(userProfileRepository.findByUserStudentIdIgnoreCase(studentUser.getStudentId())).thenReturn(Optional.of(incomplete));

        assertThrows(ProfileIncompleteException.class, () -> cbpRegistrationService.registerStudent(studentUser));
    }

    @Test
    void registerStudent_WrongRole_ThrowsForbiddenException() {
        assertThrows(ForbiddenException.class, () -> cbpRegistrationService.registerStudent(adminUser));
    }

    @Test
    void registerStudent_NullUser_ThrowsUnauthorizedException() {
        assertThrows(UnauthorizedException.class, () -> cbpRegistrationService.registerStudent(null));
    }

    @Test
    void getMyRegistration_Success() {
        CbpRegistration existing = CbpRegistration.builder()
                .registrationId("CBP7000001")
                .user(studentUser)
                .profile(completedProfile)
                .registrationStatus(RegistrationStatus.PAYMENT_PENDING)
                .studentId("2023ucp1234")
                .email("student@mnit.ac.in")
                .firstName("Parv")
                .lastName("Agrawal")
                .phoneNumber("9876543210")
                .institute("MNIT Jaipur")
                .course("BTECH")
                .branch("COMPUTER_SCIENCE_ENGINEERING")
                .year(3)
                .hosteller(true)
                .roomNumber("H-101")
                .build();
        existing.setCreatedAt(LocalDateTime.now());

        when(cbpRegistrationRepository.findByUserStudentIdIgnoreCase(studentUser.getStudentId())).thenReturn(Optional.of(existing));

        CbpRegistrationDetailResponse response = cbpRegistrationService.getMyRegistration(studentUser);

        assertNotNull(response);
        assertEquals("CBP7000001", response.registrationId());
        assertEquals("2023ucp1234", response.studentId());
        assertEquals("Parv", response.firstName());
        assertEquals("Agrawal", response.lastName());
        assertEquals(RegistrationStatus.PAYMENT_PENDING, response.registrationStatus());
    }

    @Test
    void getMyRegistration_NotFound_ThrowsException() {
        when(cbpRegistrationRepository.findByUserStudentIdIgnoreCase(studentUser.getStudentId())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> cbpRegistrationService.getMyRegistration(studentUser));
    }
}

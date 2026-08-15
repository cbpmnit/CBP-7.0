package com.cbp7.identity.profile;

import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.identity.profile.dto.request.CreateProfileRequest;
import com.cbp7.identity.profile.dto.request.UpdateProfileRequest;
import com.cbp7.identity.profile.dto.response.ProfileResponse;
import com.cbp7.identity.profile.entity.Gender;
import com.cbp7.identity.profile.entity.ProfileCompletion;
import com.cbp7.identity.profile.entity.ProgramLevel;
import com.cbp7.identity.profile.entity.StudentType;
import com.cbp7.identity.profile.entity.UserProfile;
import com.cbp7.identity.profile.repository.ProfileCompletionRepository;
import com.cbp7.identity.profile.repository.UserProfileRepository;
import com.cbp7.identity.profile.service.ProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProfileServiceTest {

    private UserProfileRepository userProfileRepository;
    private ProfileCompletionRepository profileCompletionRepository;
    private ProfileService profileService;
    private User testUser;

    private com.cbp7.identity.auth.repository.UserRepository userRepository;
    private com.cbp7.program.registration.repository.CbpRegistrationRepository cbpRegistrationRepository;

    @BeforeEach
    void setUp() {
        userProfileRepository = mock(UserProfileRepository.class);
        profileCompletionRepository = mock(ProfileCompletionRepository.class);
        userRepository = mock(com.cbp7.identity.auth.repository.UserRepository.class);
        cbpRegistrationRepository = mock(com.cbp7.program.registration.repository.CbpRegistrationRepository.class);
        com.cbp7.identity.profile.ProfileEligibilityValidator eligibilityValidator = new com.cbp7.identity.profile.ProfileEligibilityValidator();
        com.cbp7.identity.profile.ProfileCompletionCalculator calculator = new com.cbp7.identity.profile.ProfileCompletionCalculator(eligibilityValidator);

        org.mockito.Mockito.when(userRepository.save(org.mockito.ArgumentMatchers.any())).thenAnswer(invocation -> invocation.getArgument(0));

        profileService = new com.cbp7.identity.profile.service.impl.ProfileServiceImpl(
                userProfileRepository,
                profileCompletionRepository,
                userRepository,
                cbpRegistrationRepository,
                new com.cbp7.identity.profile.ProfileValidator(),
                new com.cbp7.identity.profile.ProfileMapper(),
                calculator,
                eligibilityValidator
        );

        testUser = User.builder()
                .studentId("2023ucp1234")
                .email("student@mnit.ac.in")
                .name("Parv Agrawal")
                .phoneNumber("9876543210")
                .role(Role.ROLE_STUDENT)
                .enabled(true)
                .build();
        testUser.setId(UUID.randomUUID());
    }

    @Test
    void createProfile_ValidHostellerProfile_Success() {
        CreateProfileRequest request = new CreateProfileRequest(
                "Parv",
                null,
                "Agrawal",
                "https://example.com/photo.jpg",
                Gender.MALE,
                LocalDate.of(2002, 5, 15),
                "9876543210",
                true,
                null,
                "MNIT Jaipur",
                ProgramLevel.UNDERGRADUATE,
                "Computer Science and Engineering",
                3,
                "A",
                StudentType.HOSTELLER,
                null,
                "H10",
                true,
                "H-101",
                "Jaipur",
                "Rajasthan"
        );

        when(userProfileRepository.existsByUserStudentIdIgnoreCase(testUser.getStudentId())).thenReturn(false);
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProfileResponse response = profileService.createProfile(testUser, request);

        assertNotNull(response);
        assertEquals("2023ucp1234", response.studentId());
        assertEquals("student@mnit.ac.in", response.email());
        assertEquals("Parv", response.firstName());
        assertEquals("Agrawal", response.lastName());
        assertEquals(ProgramLevel.UNDERGRADUATE, response.programLevel());
        assertEquals("Computer Science and Engineering", response.department());
        assertEquals(StudentType.HOSTELLER, response.studentType());
        assertEquals("H10", response.hostelNumber());
        assertEquals("H-101", response.roomNumber());
        verify(userProfileRepository).save(any(UserProfile.class));
        verify(profileCompletionRepository).save(any(ProfileCompletion.class));
    }

    @Test
    void createProfile_ValidDayScholarProfile_Success() {
        CreateProfileRequest request = new CreateProfileRequest(
                "Parv",
                null,
                "Agrawal",
                null,
                Gender.MALE,
                LocalDate.of(2002, 5, 15),
                "9876543210",
                true,
                null,
                "MNIT Jaipur",
                ProgramLevel.UNDERGRADUATE,
                "Computer Science and Engineering",
                2,
                "B",
                StudentType.DAY_SCHOLAR,
                "123 Malviya Nagar, Jaipur",
                null,
                false,
                null,
                "Jaipur",
                "Rajasthan"
        );

        when(userProfileRepository.existsByUserStudentIdIgnoreCase(testUser.getStudentId())).thenReturn(false);
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProfileResponse response = profileService.createProfile(testUser, request);

        assertNotNull(response);
        assertEquals(StudentType.DAY_SCHOLAR, response.studentType());
        assertEquals("123 Malviya Nagar, Jaipur", response.address());
        assertNull(response.hostelNumber());
        assertNull(response.roomNumber());
    }

    @Test
    void createProfile_DayScholar_MissingAddress_ThrowsIllegalArgumentException() {
        CreateProfileRequest request = new CreateProfileRequest(
                "Parv", null, "Agrawal", null, Gender.MALE, LocalDate.of(2002, 5, 15),
                "9876543210", true, null, "MNIT Jaipur", ProgramLevel.UNDERGRADUATE,
                "Computer Science and Engineering", 3, "A", StudentType.DAY_SCHOLAR, "   ", null, false, null, "Jaipur", "Rajasthan"
        );

        when(userProfileRepository.existsByUserStudentIdIgnoreCase(testUser.getStudentId())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> profileService.createProfile(testUser, request));
    }

    @Test
    void createProfile_InvalidYear_ThrowsIllegalArgumentException() {
        CreateProfileRequest request = new CreateProfileRequest(
                "Parv", null, "Agrawal", null, Gender.MALE, LocalDate.of(2002, 5, 15),
                "9876543210", true, null, "MNIT Jaipur", ProgramLevel.UNDERGRADUATE,
                "Computer Science and Engineering", 6, "A", StudentType.DAY_SCHOLAR, "Address", null, false, null, "Jaipur", "Rajasthan"
        );

        when(userProfileRepository.existsByUserStudentIdIgnoreCase(testUser.getStudentId())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> profileService.createProfile(testUser, request));
    }

    @Test
    void updateProfile_SuccessfulUpdate() {
        UserProfile existingProfile = UserProfile.builder()
                .user(testUser)
                .firstName("Parv")
                .lastName("Agrawal")
                .gender(Gender.MALE)
                .dateOfBirth(LocalDate.of(2002, 5, 15))
                .phoneNumber("9876543210")
                .sameAsWhatsapp(true)
                .whatsappNumber("9876543210")
                .institute("MNIT Jaipur")
                .programLevel(ProgramLevel.UNDERGRADUATE)
                .department("Computer Science and Engineering")
                .year(3)
                .studentType(StudentType.HOSTELLER)
                .hostelNumber("H10")
                .hosteller(true)
                .roomNumber("H-101")
                .build();

        when(userProfileRepository.findByUserStudentIdIgnoreCase(testUser.getStudentId())).thenReturn(Optional.of(existingProfile));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProfileRequest updateRequest = new UpdateProfileRequest(
                "Parv", null, "Agrawal", null, Gender.MALE, LocalDate.of(2002, 5, 15),
                "9876543210", true, null, "MNIT Jaipur", ProgramLevel.POSTGRADUATE,
                "Artificial Intelligence and Data Science", 4, "B", StudentType.HOSTELLER, null, "H12", true, "H-202", "Jaipur", "Rajasthan"
        );

        ProfileResponse response = profileService.updateProfile(testUser, updateRequest);

        assertNotNull(response);
        assertEquals(ProgramLevel.POSTGRADUATE, response.programLevel());
        assertEquals("Artificial Intelligence and Data Science", response.department());
        assertEquals(4, response.year());
        assertEquals(StudentType.HOSTELLER, response.studentType());
        assertEquals("H12", response.hostelNumber());
        assertEquals("H-202", response.roomNumber());
    }

    @Test
    void completion_CalculatePercentage_DayScholarComplete() {
        UserProfile dayScholarProfile = UserProfile.builder()
                .user(testUser)
                .firstName("Parv")
                .lastName("Agrawal")
                .gender(Gender.MALE)
                .dateOfBirth(LocalDate.of(2002, 5, 15))
                .phoneNumber("9876543210")
                .institute("MNIT Jaipur")
                .programLevel(ProgramLevel.UNDERGRADUATE)
                .department("Computer Science and Engineering")
                .year(3)
                .studentType(StudentType.DAY_SCHOLAR)
                .address("123 Tonk Road, Jaipur")
                .build();

        ProfileCompletion completion = profileService.calculateAndBuildCompletion(testUser, dayScholarProfile);

        assertTrue(completion.getProfileCompleted());
        assertEquals(100, completion.getCompletionPercentage());
        assertEquals("PROFILE_COMPLETE", completion.getLastCompletedStep());
    }
}

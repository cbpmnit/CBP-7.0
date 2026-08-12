package com.cbp7.profile;

import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.profile.dto.request.CreateProfileRequest;
import com.cbp7.profile.dto.request.UpdateProfileRequest;
import com.cbp7.profile.dto.response.ProfileCompletionResponse;
import com.cbp7.profile.dto.response.ProfileResponse;
import com.cbp7.profile.entity.Branch;
import com.cbp7.profile.entity.Course;
import com.cbp7.profile.entity.Gender;
import com.cbp7.profile.entity.ProfileCompletion;
import com.cbp7.profile.entity.UserProfile;
import com.cbp7.profile.repository.ProfileCompletionRepository;
import com.cbp7.profile.repository.UserProfileRepository;
import com.cbp7.profile.service.ProfileService;
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

    @BeforeEach
    void setUp() {
        userProfileRepository = mock(UserProfileRepository.class);
        profileCompletionRepository = mock(ProfileCompletionRepository.class);
        profileService = new com.cbp7.profile.service.impl.ProfileServiceImpl(
                userProfileRepository,
                profileCompletionRepository,
                new com.cbp7.profile.validation.ProfileValidator(),
                new com.cbp7.profile.mapper.ProfileMapper(),
                new com.cbp7.profile.engine.ProfileCompletionCalculator()
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
    void createProfile_ValidProfile_Success() {
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
                Course.BTECH,
                Branch.COMPUTER_SCIENCE_ENGINEERING,
                3,
                "A",
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
        assertEquals(Gender.MALE, response.gender());
        assertEquals(Course.BTECH, response.course());
        assertEquals(Branch.COMPUTER_SCIENCE_ENGINEERING, response.branch());
        assertEquals("H-101", response.roomNumber());
        verify(userProfileRepository).save(any(UserProfile.class));
        verify(profileCompletionRepository).save(any(ProfileCompletion.class));
    }

    @Test
    void createProfile_DuplicateProfile_ThrowsDuplicateResourceException() {
        CreateProfileRequest request = new CreateProfileRequest(
                "Parv", null, "Agrawal", null, Gender.MALE, LocalDate.of(2002, 5, 15),
                "9876543210", true, null, "MNIT Jaipur", Course.BTECH,
                Branch.COMPUTER_SCIENCE_ENGINEERING, 3, "A", false, null, "Jaipur", "Rajasthan"
        );

        when(userProfileRepository.existsByUserStudentIdIgnoreCase(testUser.getStudentId())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> profileService.createProfile(testUser, request));
    }

    @Test
    void createProfile_InvalidPhoneNumber_ThrowsIllegalArgumentException() {
        CreateProfileRequest request = new CreateProfileRequest(
                "Parv", null, "Agrawal", null, Gender.MALE, LocalDate.of(2002, 5, 15),
                "12345", true, null, "MNIT Jaipur", Course.BTECH,
                Branch.COMPUTER_SCIENCE_ENGINEERING, 3, "A", false, null, "Jaipur", "Rajasthan"
        );

        when(userProfileRepository.existsByUserStudentIdIgnoreCase(testUser.getStudentId())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> profileService.createProfile(testUser, request));
    }

    @Test
    void createProfile_InvalidDOB_FutureDate_ThrowsIllegalArgumentException() {
        CreateProfileRequest request = new CreateProfileRequest(
                "Parv", null, "Agrawal", null, Gender.MALE, LocalDate.now().plusDays(5),
                "9876543210", true, null, "MNIT Jaipur", Course.BTECH,
                Branch.COMPUTER_SCIENCE_ENGINEERING, 3, "A", false, null, "Jaipur", "Rajasthan"
        );

        when(userProfileRepository.existsByUserStudentIdIgnoreCase(testUser.getStudentId())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> profileService.createProfile(testUser, request));
    }

    @Test
    void createProfile_HostellerTrue_MissingRoomNumber_ThrowsIllegalArgumentException() {
        CreateProfileRequest request = new CreateProfileRequest(
                "Parv", null, "Agrawal", null, Gender.MALE, LocalDate.of(2002, 5, 15),
                "9876543210", true, null, "MNIT Jaipur", Course.BTECH,
                Branch.COMPUTER_SCIENCE_ENGINEERING, 3, "A", true, "   ", "Jaipur", "Rajasthan"
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
                .course(Course.BTECH)
                .branch(Branch.COMPUTER_SCIENCE_ENGINEERING)
                .year(3)
                .hosteller(false)
                .build();

        when(userProfileRepository.findByUserStudentIdIgnoreCase(testUser.getStudentId())).thenReturn(Optional.of(existingProfile));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProfileRequest updateRequest = new UpdateProfileRequest(
                "Parv", null, "Agrawal", null, Gender.MALE, LocalDate.of(2002, 5, 15),
                "9876543210", true, null, "MNIT Jaipur", Course.BTECH,
                Branch.ARTIFICIAL_INTELLIGENCE_DATA_SCIENCE, 4, "B", true, "H-202", "Jaipur", "Rajasthan"
        );

        ProfileResponse response = profileService.updateProfile(testUser, updateRequest);

        assertNotNull(response);
        assertEquals(Branch.ARTIFICIAL_INTELLIGENCE_DATA_SCIENCE, response.branch());
        assertEquals(4, response.year());
        assertEquals("H-202", response.roomNumber());
        assertEquals("2023ucp1234", response.studentId()); // Student ID unchanged
        assertEquals("student@mnit.ac.in", response.email()); // Email unchanged
    }

    @Test
    void updateProfile_NotFound_ThrowsResourceNotFoundException() {
        UpdateProfileRequest updateRequest = new UpdateProfileRequest(
                "Parv", null, "Agrawal", null, Gender.MALE, LocalDate.of(2002, 5, 15),
                "9876543210", true, null, "MNIT Jaipur", Course.BTECH,
                Branch.COMPUTER_SCIENCE_ENGINEERING, 3, "A", false, null, "Jaipur", "Rajasthan"
        );

        when(userProfileRepository.findByUserStudentIdIgnoreCase(testUser.getStudentId())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> profileService.updateProfile(testUser, updateRequest));
    }

    @Test
    void completion_CalculatePercentage_100Percent() {
        UserProfile fullProfile = UserProfile.builder()
                .user(testUser)
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
                .city("Jaipur")
                .state("Rajasthan")
                .hosteller(true)
                .roomNumber("H-101")
                .build();

        ProfileCompletion completion = profileService.calculateAndBuildCompletion(testUser, fullProfile);

        assertEquals(100, completion.getCompletionPercentage());
        assertTrue(completion.getProfileCompleted());
        assertEquals("PROFILE_COMPLETE", completion.getLastCompletedStep());
    }

    @Test
    void completion_CalculatePercentage_Partial() {
        UserProfile partialProfile = UserProfile.builder()
                .user(testUser)
                .firstName("Parv")
                .lastName("Agrawal")
                .gender(Gender.MALE)
                .dateOfBirth(LocalDate.of(2002, 5, 15))
                .phoneNumber("9876543210")
                .institute("MNIT Jaipur")
                .course(Course.BTECH)
                .branch(Branch.COMPUTER_SCIENCE_ENGINEERING)
                .year(3)
                .hosteller(false)
                .build();

        ProfileCompletion completion = profileService.calculateAndBuildCompletion(testUser, partialProfile);

        assertTrue(completion.getCompletionPercentage() > 0 && completion.getCompletionPercentage() < 100);
        assertFalse(completion.getProfileCompleted());
    }
}

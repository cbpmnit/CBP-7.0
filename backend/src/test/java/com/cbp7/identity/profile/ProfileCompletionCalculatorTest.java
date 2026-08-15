package com.cbp7.identity.profile;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.profile.entity.Gender;
import com.cbp7.identity.profile.entity.ProfileCompletion;
import com.cbp7.identity.profile.entity.ProgramLevel;
import com.cbp7.identity.profile.entity.StudentType;
import com.cbp7.identity.profile.entity.UserProfile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class ProfileCompletionCalculatorTest {

    private ProfileCompletionCalculator calculator;
    private ProfileEligibilityValidator eligibilityValidator;
    private User testUser;

    @BeforeEach
    void setUp() {
        eligibilityValidator = new ProfileEligibilityValidator();
        calculator = new ProfileCompletionCalculator(eligibilityValidator);
        testUser = User.builder().studentId("2024test").email("test@mnit.ac.in").build();
    }

    @Test
    void calculateAndBuildCompletion_NullProfile_ReturnsZero() {
        ProfileCompletion result = calculator.calculateAndBuildCompletion(testUser, null);
        assertNotNull(result);
        assertEquals(0, result.getCompletionPercentage());
        assertFalse(result.getProfileCompleted());
        assertEquals("PROFILE_NOT_STARTED", result.getLastCompletedStep());
    }

    @Test
    void calculateAndBuildCompletion_MandatoryOnly_EligibleAndCompleted() {
        UserProfile profile = UserProfile.builder()
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
                .hosteller(false)
                .build();

        ProfileCompletion result = calculator.calculateAndBuildCompletion(testUser, profile);
        assertTrue(result.getProfileCompleted());
        assertTrue(eligibilityValidator.canRegister(profile));
        assertEquals("PROFILE_COMPLETE", result.getLastCompletedStep());
    }

    @Test
    void calculateAndBuildCompletion_FullProfileHosteller_Returns100() {
        UserProfile profile = UserProfile.builder()
                .firstName("Parv")
                .middleName("Kumar")
                .lastName("Agrawal")
                .gender(Gender.MALE)
                .dateOfBirth(LocalDate.of(2002, 5, 15))
                .phoneNumber("9876543210")
                .sameAsWhatsapp(true)
                .institute("MNIT Jaipur")
                .programLevel(ProgramLevel.UNDERGRADUATE)
                .department("Computer Science and Engineering")
                .year(3)
                .section("A")
                .city("Jaipur")
                .state("Rajasthan")
                .profilePhotoUrl("https://example.com/photo.jpg")
                .studentType(StudentType.HOSTELLER)
                .hostelNumber("H10")
                .hosteller(true)
                .roomNumber("H-101")
                .build();

        ProfileCompletion result = calculator.calculateAndBuildCompletion(testUser, profile);
        assertEquals(100, result.getCompletionPercentage());
        assertTrue(result.getProfileCompleted());
        assertEquals("PROFILE_COMPLETE", result.getLastCompletedStep());
    }

    @Test
    void calculateAndBuildCompletion_FullProfileDayScholar_Returns100() {
        UserProfile profile = UserProfile.builder()
                .firstName("Parv")
                .middleName("Kumar")
                .lastName("Agrawal")
                .gender(Gender.MALE)
                .dateOfBirth(LocalDate.of(2002, 5, 15))
                .phoneNumber("9876543210")
                .sameAsWhatsapp(true)
                .institute("MNIT Jaipur")
                .programLevel(ProgramLevel.UNDERGRADUATE)
                .department("Computer Science and Engineering")
                .year(3)
                .section("A")
                .city("Jaipur")
                .state("Rajasthan")
                .profilePhotoUrl("https://example.com/photo.jpg")
                .studentType(StudentType.DAY_SCHOLAR)
                .address("123 Malviya Nagar, Jaipur")
                .hosteller(false)
                .build();

        ProfileCompletion result = calculator.calculateAndBuildCompletion(testUser, profile);
        assertEquals(100, result.getCompletionPercentage());
        assertTrue(result.getProfileCompleted());
        assertEquals("PROFILE_COMPLETE", result.getLastCompletedStep());
    }
}

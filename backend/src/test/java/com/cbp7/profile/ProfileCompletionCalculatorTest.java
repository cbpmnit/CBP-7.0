package com.cbp7.profile;

import com.cbp7.auth.entity.User;
import com.cbp7.profile.engine.ProfileCompletionCalculator;
import com.cbp7.profile.entity.Branch;
import com.cbp7.profile.entity.Course;
import com.cbp7.profile.entity.Gender;
import com.cbp7.profile.entity.ProfileCompletion;
import com.cbp7.profile.entity.UserProfile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class ProfileCompletionCalculatorTest {

    private ProfileCompletionCalculator calculator;
    private User testUser;

    @BeforeEach
    void setUp() {
        calculator = new ProfileCompletionCalculator();
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
    void calculateAndBuildCompletion_FullProfileHosteller_Returns100() {
        UserProfile profile = UserProfile.builder()
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

        ProfileCompletion result = calculator.calculateAndBuildCompletion(testUser, profile);
        assertEquals(100, result.getCompletionPercentage());
        assertTrue(result.getProfileCompleted());
        assertEquals("PROFILE_COMPLETE", result.getLastCompletedStep());
    }

    @Test
    void calculateAndBuildCompletion_FullProfileDayScholar_Returns100() {
        UserProfile profile = UserProfile.builder()
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
                .hosteller(false)
                .build();

        ProfileCompletion result = calculator.calculateAndBuildCompletion(testUser, profile);
        assertEquals(100, result.getCompletionPercentage());
        assertTrue(result.getProfileCompleted());
        assertEquals("PROFILE_COMPLETE", result.getLastCompletedStep());
    }
}

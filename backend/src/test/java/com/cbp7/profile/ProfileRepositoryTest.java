package com.cbp7.profile;

import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.profile.entity.Branch;
import com.cbp7.profile.entity.Course;
import com.cbp7.profile.entity.Gender;
import com.cbp7.profile.entity.ProfileCompletion;
import com.cbp7.profile.entity.UserProfile;
import com.cbp7.profile.repository.ProfileCompletionRepository;
import com.cbp7.profile.repository.UserProfileRepository;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProfileRepositoryTest {

    @Test
    void userProfileRepository_OneProfilePerUser() {
        UserProfileRepository repository = mock(UserProfileRepository.class);
        User user = User.builder().studentId("2023ucp1234").email("student@mnit.ac.in").build();
        user.setId(UUID.randomUUID());

        UserProfile profile = UserProfile.builder()
                .user(user)
                .firstName("Parv")
                .lastName("Agrawal")
                .gender(Gender.MALE)
                .dateOfBirth(LocalDate.of(2002, 5, 15))
                .phoneNumber("9876543210")
                .sameAsWhatsapp(true)
                .institute("MNIT Jaipur")
                .course(Course.BTECH)
                .branch(Branch.COMPUTER_SCIENCE_ENGINEERING)
                .year(3)
                .hosteller(false)
                .build();

        when(repository.findByUser(user)).thenReturn(Optional.of(profile));
        when(repository.existsByUser(user)).thenReturn(true);

        assertTrue(repository.existsByUser(user));

        Optional<UserProfile> found = repository.findByUser(user);
        assertTrue(found.isPresent());
        assertEquals("Parv", found.get().getFirstName());
        assertEquals(Gender.MALE, found.get().getGender());
        assertEquals(Course.BTECH, found.get().getCourse());
        assertEquals(Branch.COMPUTER_SCIENCE_ENGINEERING, found.get().getBranch());
    }

    @Test
    void profileCompletionRepository_FindsByUser() {
        ProfileCompletionRepository repository = mock(ProfileCompletionRepository.class);
        User user = User.builder().studentId("2023ucp1234").email("student@mnit.ac.in").build();
        user.setId(UUID.randomUUID());

        ProfileCompletion completion = ProfileCompletion.builder()
                .user(user)
                .profileCompleted(true)
                .completionPercentage(100)
                .lastCompletedStep("PROFILE_COMPLETE")
                .build();

        when(repository.findByUser(user)).thenReturn(Optional.of(completion));

        Optional<ProfileCompletion> found = repository.findByUser(user);
        assertTrue(found.isPresent());
        assertTrue(found.get().getProfileCompleted());
        assertEquals(100, found.get().getCompletionPercentage());
        assertEquals("PROFILE_COMPLETE", found.get().getLastCompletedStep());
    }
}

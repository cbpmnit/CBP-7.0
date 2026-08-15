package com.cbp7.identity.profile;

import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.profile.entity.Gender;
import com.cbp7.identity.profile.entity.ProgramLevel;
import com.cbp7.identity.profile.entity.StudentType;
import com.cbp7.identity.profile.entity.UserProfile;
import com.cbp7.identity.profile.repository.UserProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileRepositoryTest {

    @Mock
    private UserProfileRepository userProfileRepository;

    @Test
    void saveAndFindByUserId_Success() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .studentId("2023ucp9999")
                .email("testrepo@mnit.ac.in")
                .name("Repo Test User")
                .password("password123")
                .role(Role.ROLE_STUDENT)
                .enabled(true)
                .build();
        user.setId(userId);

        UserProfile profile = UserProfile.builder()
                .user(user)
                .firstName("Repo")
                .lastName("User")
                .gender(Gender.MALE)
                .dateOfBirth(LocalDate.of(2001, 1, 1))
                .phoneNumber("9999988888")
                .sameAsWhatsapp(true)
                .institute("MNIT Jaipur")
                .programLevel(ProgramLevel.UNDERGRADUATE)
                .department("Computer Science and Engineering")
                .year(2)
                .studentType(StudentType.HOSTELLER)
                .hostelNumber("H5")
                .hosteller(true)
                .roomNumber("H-505")
                .build();

        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));

        Optional<UserProfile> found = userProfileRepository.findByUserId(userId);
        assertTrue(found.isPresent());
        assertEquals("Repo", found.get().getFirstName());
        assertEquals(ProgramLevel.UNDERGRADUATE, found.get().getProgramLevel());
        assertEquals("Computer Science and Engineering", found.get().getDepartment());
    }
}

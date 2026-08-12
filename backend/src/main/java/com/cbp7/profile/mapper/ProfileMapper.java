package com.cbp7.profile.mapper;

import com.cbp7.auth.entity.User;
import com.cbp7.profile.dto.request.CreateProfileRequest;
import com.cbp7.profile.dto.response.ProfileResponse;
import com.cbp7.profile.entity.UserProfile;
import org.springframework.stereotype.Component;

@Component
public class ProfileMapper {

    public ProfileResponse toProfileResponse(UserProfile profile) {
        if (profile == null) {
            return null;
        }

        String studentId = profile.getUser() != null ? profile.getUser().getStudentId() : null;
        String email = profile.getUser() != null ? profile.getUser().getEmail() : null;

        return new ProfileResponse(
                studentId,
                email,
                profile.getFirstName(),
                profile.getMiddleName(),
                profile.getLastName(),
                profile.getProfilePhotoUrl(),
                profile.getGender(),
                profile.getDateOfBirth(),
                profile.getPhoneNumber(),
                profile.getSameAsWhatsapp(),
                profile.getWhatsappNumber(),
                profile.getInstitute(),
                profile.getCourse(),
                profile.getBranch(),
                profile.getYear(),
                profile.getSection(),
                profile.getHosteller(),
                profile.getRoomNumber(),
                profile.getCity(),
                profile.getState()
        );
    }

    public UserProfile toUserProfile(CreateProfileRequest request, User user, String whatsappNumber, String institute) {
        return UserProfile.builder()
                .user(user)
                .firstName(request.firstName().trim())
                .middleName(request.middleName() != null ? request.middleName().trim() : null)
                .lastName(request.lastName().trim())
                .profilePhotoUrl(request.profilePhotoUrl())
                .gender(request.gender())
                .dateOfBirth(request.dateOfBirth())
                .phoneNumber(request.phoneNumber().trim())
                .sameAsWhatsapp(Boolean.TRUE.equals(request.sameAsWhatsapp()))
                .whatsappNumber(whatsappNumber)
                .institute(institute)
                .course(request.course())
                .branch(request.branch())
                .year(request.year())
                .section(request.section() != null ? request.section().trim() : null)
                .hosteller(request.hosteller())
                .roomNumber(Boolean.TRUE.equals(request.hosteller()) ? request.roomNumber().trim() : null)
                .city(request.city() != null ? request.city().trim() : null)
                .state(request.state() != null ? request.state().trim() : null)
                .build();
    }
}

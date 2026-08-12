package com.cbp7.identity.profile;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.profile.dto.request.CreateProfileRequest;
import com.cbp7.identity.profile.dto.response.ProfileResponse;
import com.cbp7.identity.profile.entity.UserProfile;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class ProfileMapper {

    public ProfileResponse toProfileResponse(UserProfile profile) {
        if (profile == null) {
            return null;
        }

        String studentId = profile.getUser() != null ? profile.getUser().getStudentId() : null;
        String email = profile.getUser() != null ? profile.getUser().getEmail() : null;

        String fullName = buildFullName(profile.getFirstName(), profile.getMiddleName(), profile.getLastName());
        if (!StringUtils.hasText(fullName) && profile.getUser() != null) {
            fullName = profile.getUser().getName();
        }

        return new ProfileResponse(
                fullName,
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

    private String buildFullName(String first, String middle, String last) {
        StringBuilder sb = new StringBuilder();
        if (StringUtils.hasText(first)) sb.append(first.trim());
        if (StringUtils.hasText(middle)) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(middle.trim());
        }
        if (StringUtils.hasText(last)) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(last.trim());
        }
        return sb.toString().trim();
    }
}

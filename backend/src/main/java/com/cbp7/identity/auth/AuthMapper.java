package com.cbp7.identity.auth;

import com.cbp7.identity.auth.dto.response.LoginResponse;
import com.cbp7.identity.auth.dto.response.UserResponse;
import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.profile.ProfileEligibilityValidator;
import com.cbp7.identity.profile.entity.UserProfile;
import com.cbp7.identity.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class AuthMapper {

    private final UserProfileRepository userProfileRepository;
    private final ProfileEligibilityValidator profileEligibilityValidator;

    public UserResponse toUserResponse(User user) {
        if (user == null) {
            return null;
        }

        String uid = user.getId() != null ? user.getId().toString() : "";
        Set<String> roleNames = extractRoleNames(user);
        Set<String> perms = user.getPermissions() != null ? user.getPermissions() : Set.of();
        boolean isSetupComplete = isAccountSetupCompleted(user);
        boolean isProfileComplete = isProfileCompleted(user);

        return new UserResponse(
                uid,
                uid,
                user.getStudentId(),
                user.getEmail(),
                user.getName(),
                user.getPhoneNumber(),
                user.getRole() != null ? user.getRole().name() : "ROLE_STUDENT",
                roleNames,
                perms,
                isSetupComplete,
                isProfileComplete
        );
    }

    public LoginResponse toLoginResponse(User user, String token) {
        if (user == null) {
            return null;
        }

        String uid = user.getId() != null ? user.getId().toString() : "";
        Set<String> roleNames = extractRoleNames(user);
        boolean isSetupComplete = isAccountSetupCompleted(user);
        boolean isProfileComplete = isProfileCompleted(user);

        return new LoginResponse(
                token,
                uid,
                user.getStudentId(),
                user.getName(),
                user.getRole() != null ? user.getRole().name() : "ROLE_STUDENT",
                roleNames,
                user.getPermissions() != null ? user.getPermissions() : Set.of(),
                isSetupComplete,
                isProfileComplete
        );
    }

    private boolean isAccountSetupCompleted(User user) {
        if (user.getAccountSetupCompleted() != null) {
            return user.getAccountSetupCompleted();
        }
        return user.getStudentId() != null && !user.getStudentId().isBlank() && user.getPassword() != null && !user.getPassword().isBlank();
    }

    private boolean isProfileCompleted(User user) {
        if (user == null) {
            return false;
        }
        Optional<UserProfile> profileOpt = userProfileRepository.findByUser(user);
        if (profileOpt.isEmpty() && user.getId() != null) {
            profileOpt = userProfileRepository.findByUserId(user.getId());
        }
        if (profileOpt.isEmpty() && user.getStudentId() != null && !user.getStudentId().isBlank()) {
            profileOpt = userProfileRepository.findByUserStudentIdIgnoreCase(user.getStudentId());
        }
        return profileOpt.map(profileEligibilityValidator::canRegister).orElse(false);
    }

    private Set<String> extractRoleNames(User user) {
        Set<String> roleNames = new HashSet<>();
        if (user.getRole() != null) {
            roleNames.add(user.getRole().name());
        }
        if (user.getRoles() != null) {
            for (Role r : user.getRoles()) {
                roleNames.add(r.name());
            }
        }
        return roleNames;
    }
}

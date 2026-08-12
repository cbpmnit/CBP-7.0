package com.cbp7.identity.profile;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.profile.entity.ProfileCompletion;
import com.cbp7.identity.profile.entity.UserProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProfileCompletionCalculator {

    private final ProfileEligibilityValidator eligibilityValidator;

    public ProfileCompletion calculateAndBuildCompletion(User user, UserProfile profile) {
        if (profile == null) {
            return ProfileCompletion.builder()
                    .user(user)
                    .profileCompleted(false)
                    .completionPercentage(0)
                    .lastCompletedStep("PROFILE_NOT_STARTED")
                    .build();
        }

        boolean isCompleted = eligibilityValidator.isProfileComplete(profile);
        int percentage = isCompleted ? 100 : 0;
        String lastCompletedStep = isCompleted ? "PROFILE_COMPLETE" : "INCOMPLETE";

        return ProfileCompletion.builder()
                .user(user)
                .profileCompleted(isCompleted)
                .completionPercentage(percentage)
                .lastCompletedStep(lastCompletedStep)
                .build();
    }
}

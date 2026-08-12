package com.cbp7.profile.engine;

import com.cbp7.auth.entity.User;
import com.cbp7.profile.entity.ProfileCompletion;
import com.cbp7.profile.entity.UserProfile;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class ProfileCompletionCalculator {

    public ProfileCompletion calculateAndBuildCompletion(User user, UserProfile profile) {
        if (profile == null) {
            return ProfileCompletion.builder()
                    .user(user)
                    .profileCompleted(false)
                    .completionPercentage(0)
                    .lastCompletedStep("PROFILE_NOT_STARTED")
                    .build();
        }

        int percentage = 0;

        // Basic Details (40%): firstName (8%), lastName (8%), gender (8%), dateOfBirth (8%), phoneNumber (8%)
        if (StringUtils.hasText(profile.getFirstName())) percentage += 8;
        if (StringUtils.hasText(profile.getLastName())) percentage += 8;
        if (profile.getGender() != null) percentage += 8;
        if (profile.getDateOfBirth() != null) percentage += 8;
        if (StringUtils.hasText(profile.getPhoneNumber())) percentage += 8;

        // Academic Details (35%): institute (7%), course (7%), branch (7%), year (7%), section (7%)
        if (StringUtils.hasText(profile.getInstitute())) percentage += 7;
        if (profile.getCourse() != null) percentage += 7;
        if (profile.getBranch() != null) percentage += 7;
        if (profile.getYear() != null) percentage += 7;
        if (StringUtils.hasText(profile.getSection())) percentage += 7;

        // Address Details (15%): city (8%), state (7%)
        if (StringUtils.hasText(profile.getCity())) percentage += 8;
        if (StringUtils.hasText(profile.getState())) percentage += 7;

        // Residence Details (10%)
        if (Boolean.TRUE.equals(profile.getHosteller())) {
            percentage += 5;
            if (StringUtils.hasText(profile.getRoomNumber())) percentage += 5;
        } else if (Boolean.FALSE.equals(profile.getHosteller())) {
            percentage += 10;
        }

        int finalPercentage = Math.min(percentage, 100);
        boolean isCompleted = (finalPercentage == 100);

        String lastCompletedStep = determineLastCompletedStep(finalPercentage);

        return ProfileCompletion.builder()
                .user(user)
                .profileCompleted(isCompleted)
                .completionPercentage(finalPercentage)
                .lastCompletedStep(lastCompletedStep)
                .build();
    }

    private String determineLastCompletedStep(int percentage) {
        if (percentage == 100) {
            return "PROFILE_COMPLETE";
        } else if (percentage >= 90) {
            return "RESIDENCE";
        } else if (percentage >= 75) {
            return "ADDRESS";
        } else if (percentage >= 40) {
            return "ACADEMIC";
        } else {
            return "BASIC_DETAILS";
        }
    }
}

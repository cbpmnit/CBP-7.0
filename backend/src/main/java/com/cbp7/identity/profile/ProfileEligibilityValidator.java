package com.cbp7.identity.profile;

import com.cbp7.identity.profile.entity.UserProfile;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class ProfileEligibilityValidator {

    /**
     * Determines whether a student profile has fulfilled all mandatory business requirements.
     * Optional fields have ZERO impact on profile completion or registration eligibility.
     */
    public boolean isProfileComplete(UserProfile profile) {
        if (profile == null) {
            return false;
        }
        return getMissingRequiredFields(profile).isEmpty();
    }

    public boolean canRegister(UserProfile profile) {
        return isProfileComplete(profile);
    }

    /**
     * Returns the list of missing mandatory requirement fields.
     */
    public List<String> getMissingRequiredFields(UserProfile profile) {
        if (profile == null) {
            return List.of("Profile Not Created");
        }

        List<String> missing = new ArrayList<>();

        // Identity
        if (!StringUtils.hasText(profile.getFirstName())) missing.add("First Name");
        if (!StringUtils.hasText(profile.getLastName())) missing.add("Last Name");

        // Academic
        if (!StringUtils.hasText(profile.getInstitute())) missing.add("Institute / College");
        if (profile.getCourse() == null) missing.add("Course");
        if (profile.getBranch() == null) missing.add("Branch");
        if (profile.getYear() == null || profile.getYear() < 1) missing.add("Year of Study");

        // Personal
        if (profile.getGender() == null) missing.add("Gender");
        if (profile.getDateOfBirth() == null) missing.add("Date of Birth");

        // Contact
        if (!StringUtils.hasText(profile.getPhoneNumber())) {
            missing.add("Phone Number");
        }

        // Hostel requirement if hosteller is true
        if (Boolean.TRUE.equals(profile.getHosteller()) && !StringUtils.hasText(profile.getRoomNumber())) {
            missing.add("Hostel Room Number");
        }

        return missing;
    }

    public List<String> getMissingMandatoryFields(UserProfile profile) {
        return getMissingRequiredFields(profile);
    }

    public List<String> getMissingOptionalFields(UserProfile profile) {
        if (profile == null) {
            return Collections.emptyList();
        }

        List<String> missing = new ArrayList<>();

        if (!StringUtils.hasText(profile.getMiddleName())) missing.add("Middle Name");
        if (!Boolean.TRUE.equals(profile.getSameAsWhatsapp()) && !StringUtils.hasText(profile.getWhatsappNumber())) {
            missing.add("WhatsApp Number");
        }
        if (!StringUtils.hasText(profile.getSection())) missing.add("Section");
        if (!StringUtils.hasText(profile.getProfilePhotoUrl())) missing.add("Profile Photo");
        if (!StringUtils.hasText(profile.getCity())) missing.add("City");
        if (!StringUtils.hasText(profile.getState())) missing.add("State");

        return missing;
    }
}

package com.cbp7.identity.profile.service.impl;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.identity.profile.dto.request.CreateProfileRequest;
import com.cbp7.identity.profile.dto.request.UpdateProfileRequest;
import com.cbp7.identity.profile.dto.response.ProfileCompletionResponse;
import com.cbp7.identity.profile.dto.response.ProfileResponse;
import com.cbp7.identity.profile.engine.ProfileCompletionCalculator;
import com.cbp7.identity.profile.entity.ProfileCompletion;
import com.cbp7.identity.profile.entity.UserProfile;
import com.cbp7.identity.profile.mapper.ProfileMapper;
import com.cbp7.identity.profile.repository.ProfileCompletionRepository;
import com.cbp7.identity.profile.repository.UserProfileRepository;
import com.cbp7.identity.profile.service.ProfileService;
import com.cbp7.identity.profile.validation.ProfileValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileServiceImpl implements ProfileService {

    private final UserProfileRepository userProfileRepository;
    private final ProfileCompletionRepository profileCompletionRepository;
    private final ProfileValidator profileValidator;
    private final ProfileMapper profileMapper;
    private final ProfileCompletionCalculator completionCalculator;

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(User user) {
        profileValidator.validateAuthenticatedUser(user);

        UserProfile profile = userProfileRepository.findByUserStudentIdIgnoreCase(user.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for current user"));

        return profileMapper.toProfileResponse(profile);
    }

    @Override
    @Transactional
    public ProfileResponse createProfile(User user, CreateProfileRequest request) {
        profileValidator.validateAuthenticatedUser(user);

        if (userProfileRepository.existsByUserStudentIdIgnoreCase(user.getStudentId())) {
            throw new DuplicateResourceException("Profile already exists for current user");
        }

        profileValidator.validateProfileFields(
                request.dateOfBirth(),
                request.hosteller(),
                request.roomNumber(),
                request.phoneNumber(),
                request.sameAsWhatsapp(),
                request.whatsappNumber()
        );

        String whatsappNumber = resolveWhatsappNumber(request.sameAsWhatsapp(), request.phoneNumber(), request.whatsappNumber());
        String institute = resolveInstitute(request.institute());

        UserProfile profile = profileMapper.toUserProfile(request, user, whatsappNumber, institute);
        UserProfile savedProfile = userProfileRepository.save(profile);
        updateProfileCompletion(user, savedProfile);

        return profileMapper.toProfileResponse(savedProfile);
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(User user, UpdateProfileRequest request) {
        profileValidator.validateAuthenticatedUser(user);

        UserProfile profile = userProfileRepository.findByUserStudentIdIgnoreCase(user.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for current user"));

        profileValidator.validateProfileFields(
                request.dateOfBirth(),
                request.hosteller(),
                request.roomNumber(),
                request.phoneNumber(),
                request.sameAsWhatsapp(),
                request.whatsappNumber()
        );

        String whatsappNumber = resolveWhatsappNumber(request.sameAsWhatsapp(), request.phoneNumber(), request.whatsappNumber());
        String institute = resolveInstitute(request.institute());

        applyProfileUpdates(profile, request, whatsappNumber, institute);

        UserProfile updatedProfile = userProfileRepository.save(profile);
        updateProfileCompletion(user, updatedProfile);

        return profileMapper.toProfileResponse(updatedProfile);
    }

    @Override
    @Transactional
    public ProfileCompletionResponse getProfileCompletion(User user) {
        profileValidator.validateAuthenticatedUser(user);

        if (user.getStudentId() == null || user.getStudentId().isBlank()) {
            return new ProfileCompletionResponse(false, 0, "PROFILE_NOT_STARTED");
        }

        ProfileCompletion completion = profileCompletionRepository.findByUserStudentIdIgnoreCase(user.getStudentId())
                .orElseGet(() -> {
                    UserProfile profile = userProfileRepository.findByUserStudentIdIgnoreCase(user.getStudentId()).orElse(null);
                    ProfileCompletion calculated = completionCalculator.calculateAndBuildCompletion(user, profile);
                    if (profile != null) {
                        try {
                            return profileCompletionRepository.save(calculated);
                        } catch (Exception e) {
                            log.warn("Could not persist calculated profile completion for user {}: {}", user.getStudentId(), e.getMessage());
                        }
                    }
                    return calculated;
                });

        boolean isCompleted = Boolean.TRUE.equals(completion.getProfileCompleted());
        int percentage = completion.getCompletionPercentage() != null ? completion.getCompletionPercentage() : 0;
        String lastStep = completion.getLastCompletedStep() != null ? completion.getLastCompletedStep() : "PROFILE_NOT_STARTED";

        return new ProfileCompletionResponse(isCompleted, percentage, lastStep);
    }

    @Override
    public ProfileCompletion calculateAndBuildCompletion(User user, UserProfile profile) {
        return completionCalculator.calculateAndBuildCompletion(user, profile);
    }

    // --- Private Helper Methods ---

    private String resolveWhatsappNumber(Boolean sameAsWhatsapp, String phoneNumber, String whatsappNumber) {
        return Boolean.TRUE.equals(sameAsWhatsapp)
                ? (phoneNumber != null ? phoneNumber.trim() : null)
                : (whatsappNumber != null ? whatsappNumber.trim() : null);
    }

    private String resolveInstitute(String institute) {
        return StringUtils.hasText(institute) ? institute.trim() : "MNIT Jaipur";
    }

    private void applyProfileUpdates(UserProfile profile, UpdateProfileRequest request, String whatsappNumber, String institute) {
        profile.setFirstName(request.firstName().trim());
        profile.setMiddleName(request.middleName() != null ? request.middleName().trim() : null);
        profile.setLastName(request.lastName().trim());
        profile.setProfilePhotoUrl(request.profilePhotoUrl());
        profile.setGender(request.gender());
        profile.setDateOfBirth(request.dateOfBirth());
        profile.setPhoneNumber(request.phoneNumber().trim());
        profile.setSameAsWhatsapp(Boolean.TRUE.equals(request.sameAsWhatsapp()));
        profile.setWhatsappNumber(whatsappNumber);
        profile.setInstitute(institute);
        profile.setCourse(request.course());
        profile.setBranch(request.branch());
        profile.setYear(request.year());
        profile.setSection(request.section() != null ? request.section().trim() : null);
        profile.setHosteller(request.hosteller());
        profile.setRoomNumber(Boolean.TRUE.equals(request.hosteller()) ? request.roomNumber().trim() : null);
        profile.setCity(request.city() != null ? request.city().trim() : null);
        profile.setState(request.state() != null ? request.state().trim() : null);
    }

    private void updateProfileCompletion(User user, UserProfile profile) {
        ProfileCompletion completion = profileCompletionRepository.findByUserStudentIdIgnoreCase(user.getStudentId())
                .orElseGet(() -> ProfileCompletion.builder().user(user).build());

        ProfileCompletion calculated = completionCalculator.calculateAndBuildCompletion(user, profile);
        completion.setProfileCompleted(calculated.getProfileCompleted());
        completion.setCompletionPercentage(calculated.getCompletionPercentage());
        completion.setLastCompletedStep(calculated.getLastCompletedStep());

        profileCompletionRepository.save(completion);
    }
}

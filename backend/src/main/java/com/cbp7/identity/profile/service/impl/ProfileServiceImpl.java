package com.cbp7.identity.profile.service.impl;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.identity.profile.dto.request.CreateProfileRequest;
import com.cbp7.identity.profile.dto.request.UpdateProfileRequest;
import com.cbp7.identity.profile.dto.response.ProfileCompletionResponse;
import com.cbp7.identity.profile.dto.response.ProfileResponse;
import com.cbp7.identity.profile.ProfileCompletionCalculator;
import com.cbp7.identity.profile.ProfileEligibilityValidator;
import com.cbp7.identity.profile.entity.ProfileCompletion;
import com.cbp7.identity.profile.entity.UserProfile;
import com.cbp7.identity.profile.ProfileMapper;
import com.cbp7.identity.profile.repository.ProfileCompletionRepository;
import com.cbp7.identity.profile.repository.UserProfileRepository;
import com.cbp7.identity.profile.service.ProfileService;
import com.cbp7.identity.profile.ProfileValidator;
import com.cbp7.program.registration.repository.CbpRegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileServiceImpl implements ProfileService {

    private final UserProfileRepository userProfileRepository;
    private final ProfileCompletionRepository profileCompletionRepository;
    private final UserRepository userRepository;
    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final ProfileValidator profileValidator;
    private final ProfileMapper profileMapper;
    private final ProfileCompletionCalculator completionCalculator;
    private final ProfileEligibilityValidator eligibilityValidator;

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

        // Synchronize global User identity (name, phone) and registration record
        syncUserIdentityFromProfile(user, savedProfile);

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

        // Synchronize global User identity (name, phone) and registration record
        syncUserIdentityFromProfile(user, updatedProfile);

        updateProfileCompletion(user, updatedProfile);

        return profileMapper.toProfileResponse(updatedProfile);
    }

    @Override
    @Transactional
    public ProfileCompletionResponse getProfileCompletion(User user) {
        profileValidator.validateAuthenticatedUser(user);

        if (user.getStudentId() == null || user.getStudentId().isBlank()) {
            return new ProfileCompletionResponse(
                    false,
                    "INCOMPLETE",
                    false,
                    List.of("Student Account Not Registered"),
                    "PROFILE_NOT_STARTED"
            );
        }

        UserProfile profile = userProfileRepository.findByUserStudentIdIgnoreCase(user.getStudentId()).orElse(null);

        boolean isEligible = eligibilityValidator.isProfileComplete(profile);
        List<String> missingRequired = eligibilityValidator.getMissingRequiredFields(profile);
        String profileStatus = isEligible ? "COMPLETED" : "INCOMPLETE";
        String lastStep = isEligible ? "PROFILE_COMPLETE" : "INCOMPLETE";

        return new ProfileCompletionResponse(
                isEligible,
                profileStatus,
                isEligible,
                missingRequired,
                lastStep
        );
    }

    @Override
    public ProfileCompletion calculateAndBuildCompletion(User user, UserProfile profile) {
        return completionCalculator.calculateAndBuildCompletion(user, profile);
    }

    // --- Private Helper Methods ---

    /**
     * Synchronizes User identity fields (name, phone) and active CBP registration records
     * from the verified UserProfile data to maintain a single source of truth across CBP 7.0.
     */
    private void syncUserIdentityFromProfile(User user, UserProfile profile) {
        User targetUser = user;
        if (targetUser.getId() != null) {
            targetUser = userRepository.findById(targetUser.getId()).orElse(user);
        }

        String fullName = buildFullName(profile.getFirstName(), profile.getMiddleName(), profile.getLastName());
        if (StringUtils.hasText(fullName)) {
            targetUser.setName(fullName);
        }

        if (StringUtils.hasText(profile.getPhoneNumber())) {
            targetUser.setPhoneNumber(profile.getPhoneNumber().trim());
        }

        User savedUser = userRepository.save(targetUser);
        log.info("Synchronized global User identity for studentId={}: name='{}', phone='{}'",
                savedUser.getStudentId(), savedUser.getName(), savedUser.getPhoneNumber());

        // Also synchronize CBP registration record if student is already registered
        if (StringUtils.hasText(savedUser.getStudentId())) {
            cbpRegistrationRepository.findByUserStudentIdIgnoreCase(savedUser.getStudentId()).ifPresent(reg -> {
                if (StringUtils.hasText(profile.getFirstName())) {
                    reg.setFirstName(profile.getFirstName().trim());
                }
                if (StringUtils.hasText(profile.getLastName())) {
                    reg.setLastName(profile.getLastName().trim());
                }
                if (StringUtils.hasText(profile.getPhoneNumber())) {
                    reg.setPhoneNumber(profile.getPhoneNumber().trim());
                }
                cbpRegistrationRepository.save(reg);
                log.info("Synchronized CBP registration identity for registrationId={}", reg.getRegistrationId());
            });
        }
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

package com.cbp7.profile.service;

import com.cbp7.auth.entity.User;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.common.exception.UnauthorizedException;
import com.cbp7.profile.dto.CreateProfileRequest;
import com.cbp7.profile.dto.ProfileCompletionResponse;
import com.cbp7.profile.dto.ProfileResponse;
import com.cbp7.profile.dto.UpdateProfileRequest;
import com.cbp7.profile.entity.ProfileCompletion;
import com.cbp7.profile.entity.UserProfile;
import com.cbp7.profile.repository.ProfileCompletionRepository;
import com.cbp7.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\d{10}$");
    private final UserProfileRepository userProfileRepository;
    private final ProfileCompletionRepository profileCompletionRepository;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(User user) {
        validateAuthenticatedUser(user);

        UserProfile profile = userProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for current user"));

        return mapToProfileResponse(profile);
    }

    @Transactional
    public ProfileResponse createProfile(User user, CreateProfileRequest request) {
        validateAuthenticatedUser(user);

        if (userProfileRepository.existsByUser(user)) {
            throw new DuplicateResourceException("Profile already exists for current user");
        }

        validateProfileFields(
                request.dateOfBirth(),
                request.hosteller(),
                request.roomNumber(),
                request.phoneNumber(),
                request.sameAsWhatsapp(),
                request.whatsappNumber()
        );

        String whatsappNumber = Boolean.TRUE.equals(request.sameAsWhatsapp())
                ? request.phoneNumber().trim()
                : (request.whatsappNumber() != null ? request.whatsappNumber().trim() : null);

        String institute = StringUtils.hasText(request.institute())
                ? request.institute().trim()
                : "MNIT Jaipur";

        UserProfile profile = UserProfile.builder()
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

        UserProfile savedProfile = userProfileRepository.save(profile);
        updateProfileCompletion(user, savedProfile);

        return mapToProfileResponse(savedProfile);
    }

    @Transactional
    public ProfileResponse updateProfile(User user, UpdateProfileRequest request) {
        validateAuthenticatedUser(user);

        UserProfile profile = userProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for current user"));

        validateProfileFields(
                request.dateOfBirth(),
                request.hosteller(),
                request.roomNumber(),
                request.phoneNumber(),
                request.sameAsWhatsapp(),
                request.whatsappNumber()
        );

        String whatsappNumber = Boolean.TRUE.equals(request.sameAsWhatsapp())
                ? request.phoneNumber().trim()
                : (request.whatsappNumber() != null ? request.whatsappNumber().trim() : null);

        String institute = StringUtils.hasText(request.institute())
                ? request.institute().trim()
                : "MNIT Jaipur";

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

        UserProfile updatedProfile = userProfileRepository.save(profile);
        updateProfileCompletion(user, updatedProfile);

        return mapToProfileResponse(updatedProfile);
    }

    @Transactional(readOnly = true)
    public ProfileCompletionResponse getProfileCompletion(User user) {
        validateAuthenticatedUser(user);

        ProfileCompletion completion = profileCompletionRepository.findByUser(user)
                .orElseGet(() -> {
                    UserProfile profile = userProfileRepository.findByUser(user).orElse(null);
                    return calculateAndBuildCompletion(user, profile);
                });

        return new ProfileCompletionResponse(
                completion.getProfileCompleted(),
                completion.getCompletionPercentage(),
                completion.getLastCompletedStep()
        );
    }

    private void validateAuthenticatedUser(User user) {
        if (user == null) {
            throw new UnauthorizedException("User is not authenticated");
        }
    }

    private void validateProfileFields(
            LocalDate dateOfBirth,
            Boolean hosteller,
            String roomNumber,
            String phoneNumber,
            Boolean sameAsWhatsapp,
            String whatsappNumber
    ) {
        if (dateOfBirth != null && dateOfBirth.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Date of birth cannot be in the future");
        }

        if (Boolean.TRUE.equals(hosteller) && !StringUtils.hasText(roomNumber)) {
            throw new IllegalArgumentException("Room number is required when hosteller is true");
        }

        if (phoneNumber != null && !PHONE_PATTERN.matcher(phoneNumber.trim()).matches()) {
            throw new IllegalArgumentException("Phone number must be exactly 10 digits");
        }

        if (!Boolean.TRUE.equals(sameAsWhatsapp) && StringUtils.hasText(whatsappNumber)) {
            if (!PHONE_PATTERN.matcher(whatsappNumber.trim()).matches()) {
                throw new IllegalArgumentException("WhatsApp number must be exactly 10 digits");
            }
        }
    }

    private void updateProfileCompletion(User user, UserProfile profile) {
        ProfileCompletion completion = profileCompletionRepository.findByUser(user)
                .orElseGet(() -> ProfileCompletion.builder().user(user).build());

        ProfileCompletion calculated = calculateAndBuildCompletion(user, profile);
        completion.setProfileCompleted(calculated.getProfileCompleted());
        completion.setCompletionPercentage(calculated.getCompletionPercentage());
        completion.setLastCompletedStep(calculated.getLastCompletedStep());

        profileCompletionRepository.save(completion);
    }

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

        String lastCompletedStep;
        if (finalPercentage == 100) {
            lastCompletedStep = "PROFILE_COMPLETE";
        } else if (finalPercentage >= 90) {
            lastCompletedStep = "RESIDENCE";
        } else if (finalPercentage >= 75) {
            lastCompletedStep = "ADDRESS";
        } else if (finalPercentage >= 40) {
            lastCompletedStep = "ACADEMIC";
        } else {
            lastCompletedStep = "BASIC_DETAILS";
        }

        return ProfileCompletion.builder()
                .user(user)
                .profileCompleted(isCompleted)
                .completionPercentage(finalPercentage)
                .lastCompletedStep(lastCompletedStep)
                .build();
    }

    private ProfileResponse mapToProfileResponse(UserProfile profile) {
        return new ProfileResponse(
                profile.getUser().getStudentId(),
                profile.getUser().getEmail(),
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
}

package com.cbp7.program.registration.service.impl;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.program.registration.dto.response.CbpRegistrationDetailResponse;
import com.cbp7.program.registration.dto.response.CbpRegistrationResponse;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.program.registration.CbpRegistrationMapper;
import com.cbp7.program.registration.repository.CbpRegistrationRepository;
import com.cbp7.program.registration.service.CbpRegistrationService;
import com.cbp7.program.registration.CbpRegistrationValidator;
import com.cbp7.common.exception.ProfileIncompleteException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.identity.profile.entity.ProfileCompletion;
import com.cbp7.identity.profile.entity.UserProfile;
import com.cbp7.identity.profile.repository.ProfileCompletionRepository;
import com.cbp7.identity.profile.repository.UserProfileRepository;
import com.cbp7.identity.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CbpRegistrationServiceImpl implements CbpRegistrationService {

    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final UserProfileRepository userProfileRepository;
    private final ProfileCompletionRepository profileCompletionRepository;
    private final ProfileService profileService;
    private final CbpRegistrationValidator cbpRegistrationValidator;
    private final CbpRegistrationMapper cbpRegistrationMapper;

    @Override
    @Transactional
    public CbpRegistrationResponse registerStudent(User user) {
        cbpRegistrationValidator.validateStudentRole(user);

        boolean alreadyExists = cbpRegistrationRepository.existsByUserStudentIdIgnoreCase(user.getStudentId());
        if (alreadyExists) {
            throw new com.cbp7.common.exception.RegistrationAlreadyExistsException("You are already registered for CBP.");
        }

        UserProfile profile = userProfileRepository.findByUserStudentIdIgnoreCase(user.getStudentId())
                .orElseThrow(() -> new ProfileIncompleteException("Please complete your profile before registering."));

        ProfileCompletion completion = profileCompletionRepository.findByUserStudentIdIgnoreCase(user.getStudentId())
                .orElseGet(() -> profileService.calculateAndBuildCompletion(user, profile));

        cbpRegistrationValidator.validateRegistrationPreconditions(false, completion);

        String registrationId = generateRegistrationId();
        CbpRegistration registration = cbpRegistrationMapper.toEntity(user, profile, registrationId);
        CbpRegistration savedRegistration = cbpRegistrationRepository.save(registration);

        log.info("Student {} registered for CBP with registrationId: {}", user.getStudentId(), registrationId);
        return cbpRegistrationMapper.toRegistrationResponse(savedRegistration);
    }

    @Override
    @Transactional(readOnly = true)
    public CbpRegistrationDetailResponse getMyRegistration(User user) {
        cbpRegistrationValidator.validateStudentRole(user);

        CbpRegistration registration = cbpRegistrationRepository.findByUserStudentIdIgnoreCase(user.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("No CBP registration found for current user."));

        return cbpRegistrationMapper.toRegistrationDetailResponse(registration);
    }

    // --- Private Helper Methods ---

    private String generateRegistrationId() {
        long count = cbpRegistrationRepository.count() + 1;
        return String.format("CBP7%06d", count);
    }
}

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
import com.cbp7.identity.profile.entity.UserProfile;
import com.cbp7.identity.profile.repository.UserProfileRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CbpRegistrationServiceImpl implements CbpRegistrationService {

    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final UserProfileRepository userProfileRepository;
    private final CbpRegistrationValidator cbpRegistrationValidator;
    private final CbpRegistrationMapper cbpRegistrationMapper;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public CbpRegistrationResponse registerStudent(User user) {
        cbpRegistrationValidator.validateAccountSetup(user);

        // Check if student is already registered (by user object, user ID, or student ID)
        Optional<CbpRegistration> existingOpt = cbpRegistrationRepository.findByUser(user);
        if (existingOpt.isEmpty() && user.getId() != null) {
            existingOpt = cbpRegistrationRepository.findByUserId(user.getId());
        }
        if (existingOpt.isEmpty() && user.getStudentId() != null && !user.getStudentId().isBlank()) {
            existingOpt = cbpRegistrationRepository.findByUserStudentIdIgnoreCase(user.getStudentId());
        }

        if (existingOpt.isPresent()) {
            CbpRegistration existing = existingOpt.get();
            log.info("Student {} ({}) is already registered for CBP with registrationId: {}. Returning existing record.",
                    user.getStudentId(), user.getEmail(), existing.getRegistrationId());
            return cbpRegistrationMapper.toRegistrationResponse(existing);
        }

        UserProfile profile = userProfileRepository.findByUser(user)
                .or(() -> user.getId() != null ? userProfileRepository.findByUserId(user.getId()) : Optional.empty())
                .or(() -> (user.getStudentId() != null && !user.getStudentId().isBlank()) ? userProfileRepository.findByUserStudentIdIgnoreCase(user.getStudentId()) : Optional.empty())
                .orElseThrow(() -> new ProfileIncompleteException("Please complete your profile before registering."));

        cbpRegistrationValidator.validateRegistrationPreconditions(false, profile);

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

        CbpRegistration registration = cbpRegistrationRepository.findByUser(user)
                .or(() -> user.getId() != null ? cbpRegistrationRepository.findByUserId(user.getId()) : Optional.empty())
                .or(() -> (user.getStudentId() != null && !user.getStudentId().isBlank()) ? cbpRegistrationRepository.findByUserStudentIdIgnoreCase(user.getStudentId()) : Optional.empty())
                .orElseThrow(() -> new ResourceNotFoundException("No CBP registration found for current user."));

        return cbpRegistrationMapper.toRegistrationDetailResponse(registration);
    }

    // --- Private Helper Methods ---

    private String generateRegistrationId() {
        for (int attempt = 0; attempt < 5; attempt++) {
            Number nextVal;
            try {
                nextVal = (Number) entityManager.createNativeQuery("SELECT nextval('program.registration_sequence')").getSingleResult();
            } catch (Exception e) {
                log.warn("Sequence fetch failed, using fallback query: {}", e.getMessage());
                long count = cbpRegistrationRepository.count();
                nextVal = count + 1 + attempt;
            }
            String candidateId = String.format("CBP7%06d", nextVal.longValue());
            if (cbpRegistrationRepository.findByRegistrationId(candidateId).isEmpty()) {
                return candidateId;
            }
        }
        return "CBP7" + (System.currentTimeMillis() % 1000000);
    }
}

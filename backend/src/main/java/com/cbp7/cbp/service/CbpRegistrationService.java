package com.cbp7.cbp.service;

import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.cbp.dto.CbpRegistrationDetailResponse;
import com.cbp7.cbp.dto.CbpRegistrationResponse;
import com.cbp7.cbp.dto.ProfileSnapshotDto;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.enums.RegistrationStatus;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.common.exception.ForbiddenException;
import com.cbp7.common.exception.ProfileIncompleteException;
import com.cbp7.common.exception.RegistrationAlreadyExistsException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.common.exception.UnauthorizedException;
import com.cbp7.profile.entity.ProfileCompletion;
import com.cbp7.profile.entity.UserProfile;
import com.cbp7.profile.repository.ProfileCompletionRepository;
import com.cbp7.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CbpRegistrationService {

    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final UserProfileRepository userProfileRepository;
    private final ProfileCompletionRepository profileCompletionRepository;

    @Transactional
    public CbpRegistrationResponse registerStudent(User user) {
        validateStudentRole(user);

        if (cbpRegistrationRepository.existsByUserStudentIdIgnoreCase(user.getStudentId())) {
            throw new RegistrationAlreadyExistsException("You are already registered for CBP.");
        }

        UserProfile profile = userProfileRepository.findByUserStudentIdIgnoreCase(user.getStudentId())
                .orElseThrow(() -> new ProfileIncompleteException("Please complete your profile before registering."));

        ProfileCompletion completion = profileCompletionRepository.findByUserStudentIdIgnoreCase(user.getStudentId())
                .orElseThrow(() -> new ProfileIncompleteException("Please complete your profile before registering."));

        if (!Boolean.TRUE.equals(completion.getProfileCompleted())) {
            throw new ProfileIncompleteException("Please complete your profile before registering.");
        }

        long count = cbpRegistrationRepository.count() + 1;
        String registrationId = String.format("CBP7%06d", count);

        CbpRegistration registration = CbpRegistration.builder()
                .registrationId(registrationId)
                .user(user)
                .profile(profile)
                .registrationStatus(RegistrationStatus.PAYMENT_PENDING)
                .studentId(user.getStudentId())
                .email(user.getEmail())
                .firstName(profile.getFirstName())
                .middleName(profile.getMiddleName())
                .lastName(profile.getLastName())
                .phoneNumber(profile.getPhoneNumber())
                .institute(profile.getInstitute())
                .course(profile.getCourse() != null ? profile.getCourse().name() : null)
                .branch(profile.getBranch() != null ? profile.getBranch().name() : null)
                .year(profile.getYear())
                .section(profile.getSection())
                .hosteller(profile.getHosteller())
                .roomNumber(profile.getRoomNumber())
                .city(profile.getCity())
                .state(profile.getState())
                .build();

        CbpRegistration savedRegistration = cbpRegistrationRepository.save(registration);

        ProfileSnapshotDto snapshot = new ProfileSnapshotDto(
                savedRegistration.getStudentId(),
                savedRegistration.getFirstName(),
                savedRegistration.getMiddleName(),
                savedRegistration.getLastName(),
                savedRegistration.getEmail(),
                savedRegistration.getPhoneNumber(),
                savedRegistration.getInstitute(),
                savedRegistration.getCourse(),
                savedRegistration.getBranch(),
                savedRegistration.getYear(),
                savedRegistration.getSection(),
                savedRegistration.getHosteller(),
                savedRegistration.getRoomNumber(),
                savedRegistration.getCity(),
                savedRegistration.getState()
        );

        return new CbpRegistrationResponse(
                savedRegistration.getRegistrationId(),
                savedRegistration.getRegistrationStatus(),
                savedRegistration.getCreatedAt(),
                savedRegistration.getStudentId(),
                savedRegistration.getFirstName(),
                savedRegistration.getMiddleName(),
                savedRegistration.getLastName(),
                savedRegistration.getEmail(),
                savedRegistration.getPhoneNumber(),
                savedRegistration.getInstitute(),
                savedRegistration.getCourse(),
                savedRegistration.getBranch(),
                savedRegistration.getYear(),
                savedRegistration.getSection(),
                savedRegistration.getHosteller(),
                savedRegistration.getRoomNumber(),
                savedRegistration.getCity(),
                savedRegistration.getState(),
                savedRegistration.getRegistrationStatus() == RegistrationStatus.REGISTERED,
                snapshot
        );
    }

    @Transactional(readOnly = true)
    public CbpRegistrationDetailResponse getMyRegistration(User user) {
        validateStudentRole(user);

        CbpRegistration registration = cbpRegistrationRepository.findByUserStudentIdIgnoreCase(user.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("No CBP registration found for current user."));

        ProfileSnapshotDto snapshot = new ProfileSnapshotDto(
                registration.getStudentId(),
                registration.getFirstName(),
                registration.getMiddleName(),
                registration.getLastName(),
                registration.getEmail(),
                registration.getPhoneNumber(),
                registration.getInstitute(),
                registration.getCourse(),
                registration.getBranch(),
                registration.getYear(),
                registration.getSection(),
                registration.getHosteller(),
                registration.getRoomNumber(),
                registration.getCity(),
                registration.getState()
        );

        return new CbpRegistrationDetailResponse(
                registration.getRegistrationId(),
                registration.getRegistrationStatus(),
                registration.getCreatedAt(),
                registration.getStudentId(),
                registration.getFirstName(),
                registration.getMiddleName(),
                registration.getLastName(),
                registration.getEmail(),
                registration.getPhoneNumber(),
                registration.getInstitute(),
                registration.getCourse(),
                registration.getBranch(),
                registration.getYear(),
                registration.getSection(),
                registration.getHosteller(),
                registration.getRoomNumber(),
                registration.getCity(),
                registration.getState(),
                registration.getRegistrationStatus() == RegistrationStatus.REGISTERED,
                snapshot
        );
    }

    private void validateStudentRole(User user) {
        if (user == null) {
            throw new UnauthorizedException("User is not authenticated.");
        }
        if (user.getRole() != Role.ROLE_STUDENT) {
            throw new ForbiddenException("Only students can perform CBP registration.");
        }
    }
}

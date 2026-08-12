package com.cbp7.cbp.mapper;

import com.cbp7.auth.entity.User;
import com.cbp7.cbp.dto.common.ProfileSnapshotDto;
import com.cbp7.cbp.dto.response.CbpRegistrationDetailResponse;
import com.cbp7.cbp.dto.response.CbpRegistrationResponse;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.enums.RegistrationStatus;
import com.cbp7.profile.entity.UserProfile;
import org.springframework.stereotype.Component;

@Component
public class CbpRegistrationMapper {

    public ProfileSnapshotDto toProfileSnapshot(CbpRegistration registration) {
        if (registration == null) {
            return null;
        }

        return new ProfileSnapshotDto(
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
    }

    public CbpRegistrationResponse toRegistrationResponse(CbpRegistration savedRegistration) {
        if (savedRegistration == null) {
            return null;
        }

        ProfileSnapshotDto snapshot = toProfileSnapshot(savedRegistration);

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

    public CbpRegistrationDetailResponse toRegistrationDetailResponse(CbpRegistration registration) {
        if (registration == null) {
            return null;
        }

        ProfileSnapshotDto snapshot = toProfileSnapshot(registration);

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

    public CbpRegistration toEntity(User user, UserProfile profile, String registrationId) {
        return CbpRegistration.builder()
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
    }
}

package com.cbp7.program.registration;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.program.registration.dto.common.ProfileSnapshotDto;
import com.cbp7.program.registration.dto.response.CbpRegistrationDetailResponse;
import com.cbp7.program.registration.dto.response.CbpRegistrationResponse;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.program.registration.entity.RegistrationStatus;
import com.cbp7.identity.profile.entity.UserProfile;
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
                registration.getProgramLevel(),
                registration.getDepartment(),
                registration.getYear(),
                registration.getSection(),
                registration.getStudentType(),
                registration.getAddress(),
                registration.getHostelNumber(),
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
                savedRegistration.getProgramLevel(),
                savedRegistration.getDepartment(),
                savedRegistration.getYear(),
                savedRegistration.getSection(),
                savedRegistration.getStudentType(),
                savedRegistration.getAddress(),
                savedRegistration.getHostelNumber(),
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
                registration.getProgramLevel(),
                registration.getDepartment(),
                registration.getYear(),
                registration.getSection(),
                registration.getStudentType(),
                registration.getAddress(),
                registration.getHostelNumber(),
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
                .programLevel(profile.getProgramLevel() != null ? profile.getProgramLevel().name() : "UNDERGRADUATE")
                .department(profile.getDepartment() != null ? profile.getDepartment() : "Computer Science and Engineering")
                .year(profile.getYear())
                .section(profile.getSection())
                .studentType(profile.getStudentType() != null ? profile.getStudentType().name() : "DAY_SCHOLAR")
                .address(profile.getAddress())
                .hostelNumber(profile.getHostelNumber())
                .hosteller(profile.getHosteller())
                .roomNumber(profile.getRoomNumber())
                .city(profile.getCity())
                .state(profile.getState())
                .build();
    }
}

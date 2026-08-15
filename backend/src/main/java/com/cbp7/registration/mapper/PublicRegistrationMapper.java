package com.cbp7.registration.mapper;

import com.cbp7.identity.profile.entity.StudentType;
import com.cbp7.registration.dto.request.CreatePublicOrderRequest;
import com.cbp7.registration.dto.response.PublicRegistrationStatusResponse;
import com.cbp7.registration.entity.PublicRegistration;
import com.cbp7.registration.enums.PublicRegistrationStatus;
import com.cbp7.registration.validator.PublicRegistrationValidator;
import org.springframework.stereotype.Component;

@Component
public class PublicRegistrationMapper {

    public PublicRegistration toEntity(CreatePublicOrderRequest request) {
        if (request == null) {
            return null;
        }

        boolean isHosteller = request.studentType() == StudentType.HOSTELLER;

        String resolvedDept = PublicRegistrationValidator.isOtherDepartment(request.department())
                && request.customDepartment() != null
                ? request.customDepartment().trim()
                : request.department().trim();

        return PublicRegistration.builder()
                .fullName(request.fullName().trim())
                .studentId(request.studentId().trim().toUpperCase())
                .email(request.email().trim().toLowerCase())
                .mobileNumber(request.mobileNumber().trim())
                .programLevel(request.programLevel())
                .department(resolvedDept)
                .year(request.year())
                .studentType(request.studentType())
                .address(!isHosteller && request.address() != null ? request.address().trim() : null)
                .hostelNumber(isHosteller && request.hostelNumber() != null ? request.hostelNumber().trim() : null)
                .roomNumber(isHosteller && request.roomNumber() != null ? request.roomNumber().trim() : null)
                .expectations(request.expectations() != null ? request.expectations().trim() : null)
                .paymentStatus(PublicRegistrationStatus.PENDING)
                .build();
    }

    public PublicRegistrationStatusResponse toStatusResponse(PublicRegistration registration) {
        return toStatusResponse(registration, new java.math.BigDecimal("100.00"));
    }

    public PublicRegistrationStatusResponse toStatusResponse(PublicRegistration registration, java.math.BigDecimal amount) {
        if (registration == null) {
            return null;
        }

        return new PublicRegistrationStatusResponse(
                registration.getId(),
                registration.getFullName(),
                registration.getStudentId(),
                registration.getEmail(),
                registration.getMobileNumber(),
                registration.getProgramLevel() != null ? registration.getProgramLevel().name() : "UNDERGRADUATE",
                registration.getDepartment(),
                registration.getYear(),
                registration.getStudentType() != null ? registration.getStudentType().name() : "DAY_SCHOLAR",
                registration.getPaymentStatus() != null ? registration.getPaymentStatus().name() : "PENDING",
                registration.getPaymentTransactionId(),
                amount != null ? amount : new java.math.BigDecimal("100.00"),
                registration.getCreatedAt()
        );
    }
}

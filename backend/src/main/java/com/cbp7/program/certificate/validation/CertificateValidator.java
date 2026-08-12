package com.cbp7.program.certificate.validation;

import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.common.exception.ForbiddenException;
import com.cbp7.common.exception.UnauthorizedException;
import org.springframework.stereotype.Component;

@Component
public class CertificateValidator {

    public void validateStudentRole(User user) {
        if (user == null) {
            throw new UnauthorizedException("User is not authenticated");
        }
        if (user.getRole() != Role.ROLE_STUDENT) {
            throw new ForbiddenException("Only students can perform certificate operations");
        }
    }

    public void validateEligibility(boolean hasCompletedRegistration, boolean hasPaidFee, double attendancePercentage, double minimumThreshold) {
        if (!hasCompletedRegistration) {
            throw new IllegalStateException("CBP registration incomplete or not found for student");
        }
        if (!hasPaidFee) {
            throw new IllegalStateException("Payment not completed for student");
        }
        if (attendancePercentage < minimumThreshold) {
            throw new IllegalStateException(
                    String.format("Attendance percentage (%.1f%%) is below minimum threshold (%.1f%%)", attendancePercentage, minimumThreshold)
            );
        }
    }
}

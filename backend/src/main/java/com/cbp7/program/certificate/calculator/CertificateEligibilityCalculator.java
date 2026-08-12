package com.cbp7.program.certificate.calculator;

import org.springframework.stereotype.Component;

@Component
public class CertificateEligibilityCalculator {

    public boolean isEligible(double attendancePercentage, boolean isPaid, double minimumPercentage) {
        return isPaid && attendancePercentage >= minimumPercentage;
    }

    public String evaluateEligibilityStatus(boolean hasIssuedCertificate, double attendancePercentage, boolean isPaid, double minimumPercentage) {
        if (hasIssuedCertificate) {
            return "ISSUED";
        }
        if (isEligible(attendancePercentage, isPaid, minimumPercentage)) {
            return "ELIGIBLE";
        }
        return "LOCKED";
    }
}

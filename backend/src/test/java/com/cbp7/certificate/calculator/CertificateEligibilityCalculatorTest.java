package com.cbp7.certificate.calculator;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CertificateEligibilityCalculatorTest {

    private final CertificateEligibilityCalculator calculator = new CertificateEligibilityCalculator();

    @Test
    @DisplayName("isEligible requires both paid status and attendance percentage >= minimum")
    void testIsEligible() {
        assertThat(calculator.isEligible(75.0, true, 75.0)).isTrue();
        assertThat(calculator.isEligible(80.0, true, 75.0)).isTrue();
        assertThat(calculator.isEligible(74.9, true, 75.0)).isFalse();
        assertThat(calculator.isEligible(90.0, false, 75.0)).isFalse();
    }

    @Test
    @DisplayName("evaluateEligibilityStatus returns ISSUED, ELIGIBLE, or LOCKED")
    void testEvaluateEligibilityStatus() {
        assertThat(calculator.evaluateEligibilityStatus(true, 50.0, false, 75.0)).isEqualTo("ISSUED");
        assertThat(calculator.evaluateEligibilityStatus(false, 80.0, true, 75.0)).isEqualTo("ELIGIBLE");
        assertThat(calculator.evaluateEligibilityStatus(false, 60.0, true, 75.0)).isEqualTo("LOCKED");
    }
}

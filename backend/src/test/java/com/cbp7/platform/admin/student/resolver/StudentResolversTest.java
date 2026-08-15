package com.cbp7.platform.admin.student.resolver;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.program.registration.entity.RegistrationStatus;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.entity.PaymentStatus;
import com.cbp7.identity.profile.entity.UserProfile;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class StudentResolversTest {

    private final StudentIdentityResolver identityResolver = new StudentIdentityResolver();
    private final StudentPaymentStatusResolver paymentStatusResolver = new StudentPaymentStatusResolver();

    @Test
    @DisplayName("resolveEffectiveStudentId prefers user student ID, falls back to registration")
    void testResolveEffectiveStudentId() {
        User user = User.builder().studentId("2024ucp1001").build();
        CbpRegistration reg = CbpRegistration.builder().studentId("2024ucp9999").build();

        assertThat(identityResolver.resolveEffectiveStudentId(user, reg)).isEqualTo("2024ucp1001");
        assertThat(identityResolver.resolveEffectiveStudentId(null, reg)).isEqualTo("2024ucp9999");
        assertThat(identityResolver.resolveEffectiveStudentId(null, null)).isEqualTo("-");
    }

    @Test
    @DisplayName("resolveEffectiveName prioritizes user name, then registration, then profile")
    void testResolveEffectiveName() {
        User user = User.builder().name("Alice Wonderland").build();
        CbpRegistration reg = CbpRegistration.builder().firstName("Bob").lastName("Builder").build();
        UserProfile profile = UserProfile.builder().firstName("Charlie").lastName("Brown").build();

        assertThat(identityResolver.resolveEffectiveName(user, reg, profile)).isEqualTo("Alice Wonderland");
        assertThat(identityResolver.resolveEffectiveName(null, reg, profile)).isEqualTo("Bob Builder");
        assertThat(identityResolver.resolveEffectiveName(null, null, profile)).isEqualTo("Charlie Brown");
        assertThat(identityResolver.resolveEffectiveName(null, null, null)).isEqualTo("Student");
    }

    @Test
    @DisplayName("resolvePaymentStatus correctly identifies SUCCESS, FAILED, and PENDING")
    void testResolvePaymentStatus() {
        CbpRegistration regSuccess = CbpRegistration.builder().registrationStatus(RegistrationStatus.REGISTERED).build();
        CbpRegistration regPending = CbpRegistration.builder().registrationStatus(RegistrationStatus.PAYMENT_PENDING).build();

        Payment successPay = Payment.builder().paymentStatus(PaymentStatus.SUCCESS).build();
        Payment failedPay = Payment.builder().paymentStatus(PaymentStatus.FAILED).build();
        Payment pendingPay = Payment.builder().paymentStatus(PaymentStatus.PENDING).build();

        assertThat(paymentStatusResolver.resolvePaymentStatus(regSuccess, null, null)).isEqualTo("SUCCESS");
        assertThat(paymentStatusResolver.resolvePaymentStatus(regPending, List.of(successPay), null)).isEqualTo("SUCCESS");
        assertThat(paymentStatusResolver.resolvePaymentStatus(regPending, List.of(failedPay), null)).isEqualTo("FAILED");
        assertThat(paymentStatusResolver.resolvePaymentStatus(regPending, List.of(pendingPay), null)).isEqualTo("PENDING");
    }
}

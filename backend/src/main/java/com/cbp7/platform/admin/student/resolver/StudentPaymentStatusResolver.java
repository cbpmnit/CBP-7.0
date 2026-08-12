package com.cbp7.platform.admin.student.resolver;

import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.program.registration.entity.RegistrationStatus;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.entity.PaymentStatus;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class StudentPaymentStatusResolver {

    public String resolvePaymentStatus(CbpRegistration reg, List<Payment> regPayments, List<Payment> userPayments) {
        boolean isPaid = false;
        if (reg != null) {
            isPaid = reg.getRegistrationStatus() == RegistrationStatus.REGISTERED
                    || (regPayments != null && regPayments.stream().anyMatch(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS));
        }
        if (!isPaid && userPayments != null) {
            isPaid = userPayments.stream().anyMatch(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS);
        }

        if (isPaid) {
            return "SUCCESS";
        }

        boolean isFailed = false;
        if (regPayments != null) {
            isFailed = regPayments.stream().anyMatch(p -> p.getPaymentStatus() == PaymentStatus.FAILED);
        }
        if (!isFailed && userPayments != null) {
            isFailed = userPayments.stream().anyMatch(p -> p.getPaymentStatus() == PaymentStatus.FAILED);
        }

        return isFailed ? "FAILED" : "PENDING";
    }

    public boolean isPaymentSuccess(CbpRegistration reg, List<Payment> regPayments, List<Payment> userPayments) {
        return "SUCCESS".equals(resolvePaymentStatus(reg, regPayments, userPayments));
    }
}

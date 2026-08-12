package com.cbp7.payment;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.entity.PaymentMode;
import com.cbp7.payment.entity.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentTransactionFactoryTest {

    @Mock
    private PaymentRepository paymentRepository;

    private PaymentTransactionFactory factory;

    @BeforeEach
    void setUp() {
        factory = new PaymentTransactionFactory(paymentRepository);
    }

    @Test
    @DisplayName("createPendingPayment constructs and persists pending payment")
    void testCreatePendingPayment() {
        User user = User.builder().id(UUID.randomUUID()).build();
        CbpRegistration reg = CbpRegistration.builder().id(UUID.randomUUID()).build();

        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        Payment result = factory.createPendingPayment(user, reg, PaymentMode.ONLINE, BigDecimal.valueOf(500));

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(user.getId());
        assertThat(result.getRegistrationId()).isEqualTo(reg.getId());
        assertThat(result.getPaymentStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(result.getAmount()).isEqualTo(BigDecimal.valueOf(500));
    }

    @Test
    @DisplayName("generateTransactionId generates CBP_TXN_ prefixed transaction ID")
    void testGenerateTransactionId() {
        String txnId = factory.generateTransactionId();
        assertThat(txnId).startsWith("CBP_TXN_");
    }
}

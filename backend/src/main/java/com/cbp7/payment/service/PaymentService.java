package com.cbp7.payment.service;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.payment.dto.request.CreatePaymentRequest;
import com.cbp7.payment.dto.response.PaymentDetailResponse;
import com.cbp7.payment.dto.response.PaymentResponse;
import com.cbp7.payment.dto.response.PaymentStatusResponse;
import com.cbp7.payment.dto.response.PhonePePaymentResponse;
import com.cbp7.payment.dto.response.PhonePeStatusDetailsResponse;

public interface PaymentService {

    PaymentResponse createPayment(User user, CreatePaymentRequest request);

    PhonePePaymentResponse initiatePhonePePayment(User user);

    PaymentDetailResponse getMyPayment(User user);

    PaymentStatusResponse verifyAndGetPaymentStatus(User user, String transactionId);
    
    PhonePeStatusDetailsResponse verifyAndGetStatusDetails(User user, String transactionId);
}

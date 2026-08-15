package com.cbp7.registration.service;

import com.cbp7.registration.dto.request.CompletePublicRegistrationRequest;
import com.cbp7.registration.dto.request.CreatePublicOrderRequest;
import com.cbp7.registration.dto.request.PublicPaymentCallbackRequest;
import com.cbp7.registration.dto.response.PaymentConfigResponse;
import com.cbp7.registration.dto.response.PublicOrderResponse;
import com.cbp7.registration.dto.response.PublicRegistrationStatusResponse;

import java.util.UUID;

public interface PublicRegistrationService {
    PaymentConfigResponse getPaymentConfig();
    PublicOrderResponse createOrder(CreatePublicOrderRequest request);
    PublicOrderResponse initiatePaymentOrder(UUID registrationId);
    PublicRegistrationStatusResponse completeRegistration(CompletePublicRegistrationRequest request);
    PublicRegistrationStatusResponse processPaymentCallback(PublicPaymentCallbackRequest request);
    PublicRegistrationStatusResponse getRegistrationStatus(UUID registrationId);
    PublicRegistrationStatusResponse getPaymentStatusByMerchantOrderId(String merchantOrderId);
    com.cbp7.registration.dto.response.PublicStatusCheckResponse checkRegistrationStatus(com.cbp7.registration.dto.request.PublicStatusCheckRequest request);
}

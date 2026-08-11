package com.cbp7.payment.gateway;

import com.cbp7.common.exception.*;
import com.cbp7.payment.config.PhonePeConfig;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.dto.PhonePeStatusResponse;
import com.phonepe.sdk.pg.payments.v2.StandardCheckoutClient;
import com.phonepe.sdk.pg.payments.v2.models.request.StandardCheckoutPayRequest;
import com.phonepe.sdk.pg.payments.v2.models.response.StandardCheckoutPayResponse;
import com.phonepe.sdk.pg.common.models.MetaInfo;
import com.phonepe.sdk.pg.common.models.response.OrderStatusResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class PhonePeGateway implements PaymentGateway {

    private final PhonePeConfig phonePeConfig;
    private final StandardCheckoutClient standardCheckoutClient;
    private final com.cbp7.common.config.FrontendProperties frontendProperties;

    @Override
    public String initiatePayment(Payment payment) {
        try {
            long amountInPaise = payment.getAmount().multiply(new BigDecimal("100")).longValue();

            MetaInfo metaInfo = new MetaInfo();
            if (payment.getRegistrationId() != null) {
                metaInfo.setUdf1(payment.getRegistrationId().toString());
            }
            if (payment.getUserId() != null) {
                metaInfo.setUdf2(payment.getUserId().toString());
            }

            String finalRedirectUrl = frontendProperties.getPaymentStatusUrl() + "/" + payment.getTransactionId();

            StandardCheckoutPayRequest payRequest = StandardCheckoutPayRequest.builder()
                    .merchantOrderId(payment.getTransactionId())
                    .amount(amountInPaise)
                    .redirectUrl(finalRedirectUrl)
                    .callbackUrl(phonePeConfig.getCallbackUrl())
                    .metaInfo(metaInfo)
                    .build();

            log.info("Sending payment initiation request to PhonePe Standard Checkout for Transaction ID: {} with callback URL: {}", payment.getTransactionId(), phonePeConfig.getCallbackUrl());
            log.info("PhonePe environment: {}, clientId: {}", phonePeConfig.getEnvironment(), maskClientId(phonePeConfig.getClientId()));

            StandardCheckoutPayResponse payResponse = standardCheckoutClient.pay(payRequest);
            String redirectUrl = payResponse.getRedirectUrl();
            log.info("PhonePe payment initiated successfully. Redirect URL: {}", redirectUrl);
            return redirectUrl;

        } catch (com.phonepe.sdk.pg.common.exception.PhonePeException e) {
            throw handlePhonePeException(e, "initiate");
        } catch (Exception e) {
            log.error("PhonePe payment initiation failed - Unexpected error: {}", e.getMessage(), e);
            throw new PhonePeGatewayException("Unable to initiate payment");
        }
    }

    @Override
    public PhonePeStatusResponse checkPaymentStatus(String transactionId) {
        try {
            log.info("Sending payment status query to PhonePe for Transaction ID: {}", transactionId);
            log.info("PhonePe environment: {}, clientId: {}", phonePeConfig.getEnvironment(), maskClientId(phonePeConfig.getClientId()));

            OrderStatusResponse response = standardCheckoutClient.getOrderStatus(transactionId);
            
            String state = response.getState();
            boolean success = "COMPLETED".equalsIgnoreCase(state);
            String code = success ? "PAYMENT_SUCCESS" : ("FAILED".equalsIgnoreCase(state) ? "PAYMENT_ERROR" : "PENDING");
            String message = response.getErrorCode();

            return new PhonePeStatusResponse(transactionId, state, success, code, message);

        } catch (com.phonepe.sdk.pg.common.exception.PhonePeException e) {
            throw handlePhonePeException(e, "retrieve status of");
        } catch (Exception e) {
            log.error("PhonePe status query failed - Unexpected error: {}", e.getMessage(), e);
            throw new PhonePeGatewayException("Unable to retrieve payment status");
        }
    }

    private RuntimeException handlePhonePeException(com.phonepe.sdk.pg.common.exception.PhonePeException e, String operation) {
        int status = e.getHttpStatusCode();
        String errorCode = e.getCode();
        String message = e.getMessage();

        log.error("PhonePe API failed - Status: {}, Code: {}, Message: {}", status, errorCode, message);

        if (status == 400) {
            return new PhonePeBadRequestException("PhonePe bad request: " + message);
        } else {
            return new PhonePeGatewayException("Unable to " + operation + " payment");
        }
    }

    private String maskClientId(String clientId) {
        if (clientId == null) {
            return "null";
        }
        if (clientId.length() <= 4) {
            return "****";
        }
        return clientId.substring(0, 2) + "****" + clientId.substring(clientId.length() - 4);
    }
}

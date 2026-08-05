package com.cbp7.payment.gateway;

import com.cbp7.common.exception.BadGatewayException;
import com.cbp7.payment.config.PhonePeConfig;
import com.cbp7.payment.entity.Payment;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class PhonePeGateway implements PaymentGateway {

    private final PhonePeConfig phonePeConfig;
    
    @lombok.Setter
    @lombok.NonNull
    private RestClient phonepeRestClient;
    
    private final ObjectMapper objectMapper;

    @Override
    public String initiatePayment(Payment payment) {
        try {
            String apiPath = "/pg/v1/pay";

            // Prepare PhonePe payment payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("merchantId", phonePeConfig.getClientId());
            payload.put("merchantTransactionId", payment.getTransactionId());
            payload.put("merchantUserId", payment.getUserId().toString());
            
            // Amount in paise (1 INR = 100 paise)
            long amountInPaise = payment.getAmount().multiply(new BigDecimal("100")).longValue();
            payload.put("amount", amountInPaise);
            
            // Redirect back to frontend
            payload.put("redirectUrl", phonePeConfig.getRedirectUrl());
            payload.put("redirectMode", "REDIRECT");
            payload.put("callbackUrl", phonePeConfig.getCallbackUrl());

            Map<String, Object> paymentInstrument = new HashMap<>();
            paymentInstrument.put("type", "PAY_PAGE");
            payload.put("paymentInstrument", paymentInstrument);

            // Base64 encode the payload
            String jsonPayload = objectMapper.writeValueAsString(payload);
            String base64Payload = Base64.getEncoder().encodeToString(jsonPayload.getBytes(StandardCharsets.UTF_8));

            // Generate X-VERIFY checksum signature
            String checksum = generateChecksum(base64Payload, apiPath, phonePeConfig.getClientSecret(), phonePeConfig.getClientVersion());

            // Build request body wrapper
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("request", base64Payload);

            log.info("Sending payment initiation request to PhonePe for Transaction ID: {}", payment.getTransactionId());

            // Call PhonePe payment endpoint
            ResponseEntity<String> responseEntity = phonepeRestClient.post()
                    .uri(apiPath)
                    .header("Content-Type", "application/json")
                    .header("X-VERIFY", checksum)
                    .body(requestBody)
                    .retrieve()
                    .toEntity(String.class);

            String responseBody = responseEntity.getBody();
            if (responseBody == null) {
                throw new BadGatewayException("Unable to initiate payment");
            }

            JsonNode rootNode = objectMapper.readTree(responseBody);
            if (rootNode.path("success").asBoolean()) {
                String redirectUrl = rootNode.path("data")
                        .path("instrumentResponse")
                        .path("redirectInfo")
                        .path("url")
                        .asText();
                log.info("PhonePe payment initiated successfully. Redirect URL: {}", redirectUrl);
                return redirectUrl;
            } else {
                String msg = rootNode.path("message").asText("Unknown PhonePe error");
                log.error("PhonePe API initiation returned success=false: {}", msg);
                throw new BadGatewayException("Unable to initiate payment");
            }

        } catch (RestClientResponseException e) {
            log.error("PhonePe RestClient returned non-2xx status: {}, body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new BadGatewayException("Unable to initiate payment");
        } catch (Exception e) {
            log.error("Error communicating with PhonePe gateway: {}", e.getMessage(), e);
            throw new BadGatewayException("Unable to initiate payment");
        }
    }

    private String generateChecksum(String base64Body, String apiPath, String saltKey, String saltIndex) {
        try {
            String input = base64Body + apiPath + saltKey;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString() + "###" + saltIndex;
        } catch (Exception e) {
            throw new RuntimeException("Error generating SHA-256 checksum", e);
        }
    }
}

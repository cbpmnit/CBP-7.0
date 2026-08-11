package com.cbp7.payment.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

@Configuration
@ConfigurationProperties(prefix = "phonepe")
@Validated
@Getter
@Setter
public class PhonePeConfig {

    @NotBlank(message = "PhonePe client ID must be configured")
    private String clientId;

    @NotBlank(message = "PhonePe client secret must be configured")
    private String clientSecret;

    @NotBlank(message = "PhonePe client version must be configured")
    private String clientVersion;

    @NotBlank(message = "PhonePe environment must be configured")
    private String environment;

    private String baseUrl;

    @NotBlank(message = "PhonePe redirect URL is not configured")
    private String redirectUrl;

    @NotBlank(message = "PhonePe callback URL is not configured")
    private String callbackUrl;

    @NotBlank(message = "PhonePe callback username must be configured")
    private String callbackUsername;

    @NotBlank(message = "PhonePe callback password must be configured")
    private String callbackPassword;

    private int reconciliationMinutes = 15;

    private int reconciliationMaxAgeHours = 24;

    @Override
    public String toString() {
        return "PhonePeConfig{" +
                "clientId='" + clientId + '\'' +
                ", clientSecret='[PROTECTED]'" +
                ", clientVersion='" + clientVersion + '\'' +
                ", environment='" + environment + '\'' +
                ", baseUrl='" + baseUrl + '\'' +
                ", redirectUrl='" + redirectUrl + '\'' +
                ", callbackUrl='" + callbackUrl + '\'' +
                ", callbackUsername='" + callbackUsername + '\'' +
                ", callbackPassword='[PROTECTED]'" +
                ", reconciliationMinutes=" + reconciliationMinutes +
                ", reconciliationMaxAgeHours=" + reconciliationMaxAgeHours +
                '}';
    }
}

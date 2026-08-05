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

    @NotBlank(message = "PhonePe base URL must be configured")
    private String baseUrl;

    @NotBlank(message = "PhonePe redirect URL is not configured")
    private String redirectUrl;

    @NotBlank(message = "PhonePe callback URL is not configured")
    private String callbackUrl;

    @Override
    public String toString() {
        return "PhonePeConfig{" +
                "clientId='" + clientId + '\'' +
                ", clientSecret='[PROTECTED]'" +
                ", clientVersion='" + clientVersion + '\'' +
                ", baseUrl='" + baseUrl + '\'' +
                ", redirectUrl='" + redirectUrl + '\'' +
                ", callbackUrl='" + callbackUrl + '\'' +
                '}';
    }
}

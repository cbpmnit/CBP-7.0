package com.cbp7.common.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "frontend")
@Getter
@Setter
public class FrontendProperties {

    /**
     * Frontend Base URL (configured via application properties e.g. frontend.url)
     */
    private String url;

    /**
     * Optional explicitly configured Frontend Payment Status URL
     */
    private String paymentStatusUrl;

    public String getUrl() {
        if (url == null || url.isBlank()) {
            throw new IllegalStateException("Frontend URL is not configured. Please check 'frontend.url' or FRONTEND_URL property.");
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    public String getPaymentStatusUrl() {
        if (paymentStatusUrl != null && !paymentStatusUrl.isBlank()) {
            return paymentStatusUrl;
        }
        return getUrl() + "/payment-status";
    }

    public String buildUrl(String path) {
        String baseUrl = getUrl();
        String cleanPath = path != null ? path : "";
        if (!cleanPath.startsWith("/")) {
            cleanPath = "/" + cleanPath;
        }
        return baseUrl + cleanPath;
    }
}

package com.cbp7.registration.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "cbp.registration")
public class PublicRegistrationProperties {

    private BigDecimal fee = new BigDecimal("100.00");

    public BigDecimal getAmount() {
        return fee != null ? fee : new BigDecimal("100.00");
    }

    public String getCurrency() {
        return "INR";
    }
}

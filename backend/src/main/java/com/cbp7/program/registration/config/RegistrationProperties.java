package com.cbp7.program.registration.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
@ConfigurationProperties(prefix = "cbp.registration")
@Getter
@Setter
public class RegistrationProperties {
    private BigDecimal fee;
}

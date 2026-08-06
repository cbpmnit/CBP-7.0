package com.cbp7.payment.config;

import com.phonepe.sdk.pg.Env;
import com.phonepe.sdk.pg.payments.v2.StandardCheckoutClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PhonePeClientConfig {

    @Bean
    public StandardCheckoutClient standardCheckoutClient(PhonePeConfig config) {
        Env env = "PRODUCTION".equalsIgnoreCase(config.getEnvironment()) ? Env.PRODUCTION : Env.SANDBOX;
        return StandardCheckoutClient.getInstance(
                config.getClientId(),
                config.getClientSecret(),
                Integer.parseInt(config.getClientVersion()),
                env
        );
    }
}

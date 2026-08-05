package com.cbp7.payment.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class HttpClientConfig {

    @Bean
    public RestClient.Builder phonepeRestClientBuilder(PhonePeConfig phonePeConfig) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(10));
        requestFactory.setReadTimeout(Duration.ofSeconds(10));

        return RestClient.builder()
                .baseUrl(phonePeConfig.getBaseUrl())
                .requestFactory(requestFactory);
    }

    @Bean
    public RestClient phonepeRestClient(RestClient.Builder phonepeRestClientBuilder) {
        return phonepeRestClientBuilder.build();
    }
}

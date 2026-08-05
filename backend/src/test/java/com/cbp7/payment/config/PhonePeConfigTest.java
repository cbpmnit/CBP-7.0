package com.cbp7.payment.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class PhonePeConfigTest {

    @Autowired
    private PhonePeConfig phonePeConfig;

    @Test
    void shouldLoadPhonePeConfigSuccessfully() {
        assertNotNull(phonePeConfig);
        assertEquals("xxxxx", phonePeConfig.getClientId());
        assertEquals("xxxxx", phonePeConfig.getClientSecret());
        assertEquals("1", phonePeConfig.getClientVersion());
        assertEquals("https://api-preprod.phonepe.com", phonePeConfig.getBaseUrl());
        assertEquals("http://localhost:3000/payment-status", phonePeConfig.getRedirectUrl());
        assertEquals("http://localhost:9900/api/v1/payment/phonepe/callback", phonePeConfig.getCallbackUrl());
    }

    @Test
    void shouldNotExposeSecretInToString() {
        String toStringResult = phonePeConfig.toString();
        assertFalse(toStringResult.contains("clientSecret='" + phonePeConfig.getClientSecret() + "'"));
        assertTrue(toStringResult.contains("[PROTECTED]"));
    }
}

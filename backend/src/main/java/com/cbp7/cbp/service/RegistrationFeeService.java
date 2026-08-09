package com.cbp7.cbp.service;

import com.cbp7.cbp.config.RegistrationProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class RegistrationFeeService {

    private final RegistrationProperties registrationProperties;

    public BigDecimal getRegistrationFee() {
        return registrationProperties.getFee();
    }
}

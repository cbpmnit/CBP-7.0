package com.cbp7.program.registration.service;

import com.cbp7.program.registration.config.RegistrationProperties;
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

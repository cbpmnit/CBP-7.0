package com.cbp7.cbp.dto;

import com.cbp7.cbp.enums.RegistrationStatus;

public record CbpRegistrationResponse(
        String registrationId,
        RegistrationStatus registrationStatus
) {}

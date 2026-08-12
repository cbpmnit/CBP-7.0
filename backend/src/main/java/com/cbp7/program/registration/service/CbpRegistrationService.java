package com.cbp7.program.registration.service;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.program.registration.dto.response.CbpRegistrationDetailResponse;
import com.cbp7.program.registration.dto.response.CbpRegistrationResponse;

public interface CbpRegistrationService {
    CbpRegistrationResponse registerStudent(User user);
    CbpRegistrationDetailResponse getMyRegistration(User user);
}

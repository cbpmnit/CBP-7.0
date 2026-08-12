package com.cbp7.cbp.service;

import com.cbp7.auth.entity.User;
import com.cbp7.cbp.dto.response.CbpRegistrationDetailResponse;
import com.cbp7.cbp.dto.response.CbpRegistrationResponse;

public interface CbpRegistrationService {
    CbpRegistrationResponse registerStudent(User user);
    CbpRegistrationDetailResponse getMyRegistration(User user);
}

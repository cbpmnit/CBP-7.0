package com.cbp7.cbp.controller;

import com.cbp7.cbp.service.RegistrationFeeService;
import com.cbp7.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/config")
@RequiredArgsConstructor
public class PublicConfigController {

    private final RegistrationFeeService registrationFeeService;

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPublicConfig() {
        return ResponseEntity.ok(ApiResponse.success(
                "Public configurations retrieved successfully",
                Map.of("registrationFee", registrationFeeService.getRegistrationFee())
        ));
    }
}

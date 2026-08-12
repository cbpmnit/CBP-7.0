package com.cbp7.program.attendance.qr.controller;

import com.cbp7.program.attendance.qr.service.AttendanceQrService;
import com.cbp7.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/attendance/qr")
@RequiredArgsConstructor
public class AttendanceQrController {

    private final AttendanceQrService qrService;

    @GetMapping("/image/{token}")
    public ResponseEntity<byte[]> getQrImage(@PathVariable String token) {
        byte[] imageBytes = qrService.generateQrImage(token);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"attendance_qr.png\"")
                .contentType(MediaType.IMAGE_PNG)
                .body(imageBytes);
    }

    @GetMapping("/validate/{token}")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(@PathVariable String token) {
        boolean valid = qrService.validateQrToken(token) != null;
        return ResponseEntity.ok(ApiResponse.success("Token validated successfully", valid));
    }
}

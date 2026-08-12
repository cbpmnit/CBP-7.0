package com.cbp7.certificate.service;

import com.cbp7.certificate.dto.response.CertificateResponse;

import java.util.List;

public interface CertificateService {
    CertificateResponse generateCertificateForStudent(String studentId);
    List<CertificateResponse> generateAllEligibleCertificates();
    CertificateResponse getStudentCertificate(String studentId);
    byte[] getStudentCertificatePdfBytes(String studentId);
    void verifyEligibility(String studentId);
    List<CertificateResponse> publishAllCertificates();
    byte[] exportCertificatesCsv();
}

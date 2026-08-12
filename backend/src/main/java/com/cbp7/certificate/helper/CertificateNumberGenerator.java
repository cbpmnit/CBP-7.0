package com.cbp7.certificate.helper;

import com.cbp7.certificate.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CertificateNumberGenerator {

    private final CertificateRepository certificateRepository;

    public String generateUniqueCertificateNumber() {
        long count = certificateRepository.count() + 1;
        String number;
        do {
            number = "CBP-2026-" + String.format("%06d", count++);
        } while (certificateRepository.existsByCertificateNumber(number));
        return number;
    }
}

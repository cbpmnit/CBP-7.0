package com.cbp7.platform.notification.processor;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.cbp7.program.registration.service.RegistrationFeeService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TemplateProcessorService {

    private final RegistrationFeeService registrationFeeService;

    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\{\\{\\s*([a-zA-Z0-9_]+)\\s*\\}\\}");

    public String processTemplate(String templateContent, Map<String, String> variables) {
        if (templateContent == null || templateContent.isEmpty()) {
            return "";
        }

        if (variables == null) {
            variables = Map.of();
        }

        Matcher matcher = VARIABLE_PATTERN.matcher(templateContent);
        StringBuilder sb = new StringBuilder();

        while (matcher.find()) {
            String varName = matcher.group(1);
            String replacement = variables.get(varName);

            if (replacement == null) {
                // Default fallback values for common system variables
                replacement = getDefaultValueForVariable(varName);
            }

            // Quote replacement to escape regex special chars ($ and \)
            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(sb);

        return sb.toString();
    }

    private String getDefaultValueForVariable(String key) {
        return switch (key) {
            case "studentName" -> "Participant";
            case "studentId" -> "2024UCH1198";
            case "email" -> "student@mnit.ac.in";
            case "phoneNumber" -> "+91 98765 43210";
            case "amount" -> registrationFeeService != null && registrationFeeService.getRegistrationFee() != null
                    ? registrationFeeService.getRegistrationFee().setScale(2, java.math.RoundingMode.HALF_UP).toString()
                    : "100.00";
            case "transactionId" -> "TXN_CBP_SAMPLE";
            case "paidAt" -> "09 August 2026";
            case "paymentStatus" -> "SUCCESS";
            case "sessionName" -> "Capacity Building Workshop";
            case "sessionDate" -> "10 August 2026";
            case "venue" -> "VLTC Main Auditorium, MNIT Jaipur";
            case "qrCode" -> "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=CBP-2026-GATE-PASS";
            case "certificateUrl" -> "https://cbp.mnit.ac.in/certificate/download/CBP-2026";
            case "certificateNumber" -> "CBP-2026-8841-MNIT";
            case "issueDate" -> "15 August 2026";
            default -> "";
        };
    }
}

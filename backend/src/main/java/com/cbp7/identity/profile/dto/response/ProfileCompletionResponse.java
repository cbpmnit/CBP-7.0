package com.cbp7.identity.profile.dto.response;

import java.util.List;

public record ProfileCompletionResponse(
        Boolean completed,
        String profileStatus,
        Boolean registrationEligible,
        List<String> missingRequiredFields,
        String lastCompletedStep
) {
    // Backward-compatible constructor for existing tests/callers if needed
    public ProfileCompletionResponse(Boolean completed, Integer completionPercentage, String lastCompletedStep) {
        this(
                Boolean.TRUE.equals(completed),
                Boolean.TRUE.equals(completed) ? "COMPLETED" : "INCOMPLETE",
                Boolean.TRUE.equals(completed),
                List.of(),
                lastCompletedStep
        );
    }

    public ProfileCompletionResponse(
            Boolean completed,
            Integer completionPercentage,
            Boolean registrationEligible,
            String profileStatus,
            List<String> missingMandatoryFields,
            List<String> missingOptionalFields,
            String lastCompletedStep
    ) {
        this(
                Boolean.TRUE.equals(registrationEligible) || Boolean.TRUE.equals(completed),
                profileStatus != null ? profileStatus : (Boolean.TRUE.equals(completed) ? "COMPLETED" : "INCOMPLETE"),
                Boolean.TRUE.equals(registrationEligible) || Boolean.TRUE.equals(completed),
                missingMandatoryFields != null ? missingMandatoryFields : List.of(),
                lastCompletedStep
        );
    }
}

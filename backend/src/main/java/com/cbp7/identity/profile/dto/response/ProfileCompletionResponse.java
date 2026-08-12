package com.cbp7.identity.profile.dto.response;

public record ProfileCompletionResponse(
        Boolean completed,
        Integer completionPercentage,
        String lastCompletedStep
) {}

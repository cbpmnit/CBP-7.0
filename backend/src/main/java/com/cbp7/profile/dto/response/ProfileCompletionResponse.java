package com.cbp7.profile.dto.response;

public record ProfileCompletionResponse(
        Boolean completed,
        Integer completionPercentage,
        String lastCompletedStep
) {}

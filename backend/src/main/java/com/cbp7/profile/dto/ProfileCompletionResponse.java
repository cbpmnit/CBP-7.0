package com.cbp7.profile.dto;

public record ProfileCompletionResponse(
        Boolean completed,
        Integer completionPercentage,
        String lastCompletedStep
) {}

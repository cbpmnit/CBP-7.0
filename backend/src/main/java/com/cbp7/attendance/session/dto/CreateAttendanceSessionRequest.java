package com.cbp7.attendance.session.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record CreateAttendanceSessionRequest(
        @NotNull(message = "Day number is required")
        Integer dayNumber,

        @NotBlank(message = "Session title is required")
        String title,

        String description,

        @NotNull(message = "Session date is required")
        LocalDate sessionDate,

        LocalTime startTime,
        LocalTime endTime,
        String venue
) {}

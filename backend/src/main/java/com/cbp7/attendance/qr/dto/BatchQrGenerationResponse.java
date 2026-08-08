package com.cbp7.attendance.qr.dto;

public record BatchQrGenerationResponse(
        long totalStudents,
        long generated
) {}

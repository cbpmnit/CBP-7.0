package com.cbp7.attendance.qr.dto.response;

public record BatchQrGenerationResponse(
        long totalStudents,
        long generated
) {}

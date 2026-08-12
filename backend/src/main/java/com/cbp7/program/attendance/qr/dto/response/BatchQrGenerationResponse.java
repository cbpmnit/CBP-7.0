package com.cbp7.program.attendance.qr.dto.response;

public record BatchQrGenerationResponse(
        long totalStudents,
        long generated
) {}

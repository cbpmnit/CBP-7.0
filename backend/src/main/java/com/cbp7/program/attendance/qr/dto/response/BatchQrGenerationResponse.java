package com.cbp7.program.attendance.qr.dto.response;

public record BatchQrGenerationResponse(
        long totalStudents,
        long generated,
        long generatedCount,
        long skippedCount,
        long alreadyAttendedCount,
        long alreadyHasQrCount,
        String summaryMessage
) {
    public BatchQrGenerationResponse(long totalStudents, long generated) {
        this(totalStudents, generated, generated, totalStudents - generated, 0, 0, "QR generation completed");
    }
}

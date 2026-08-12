package com.cbp7.program.attendance.record.calculator;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class AttendanceCalculator {

    public double calculatePercentage(long attendedCount, long totalSessions) {
        if (totalSessions <= 0 || attendedCount <= 0) {
            return 0.0;
        }
        double raw = ((double) attendedCount / totalSessions) * 100.0;
        return roundToTwoDecimals(raw);
    }

    public long calculateAbsentCount(long totalRegistered, long presentCount) {
        return Math.max(0, totalRegistered - presentCount);
    }

    public double roundToTwoDecimals(double value) {
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}

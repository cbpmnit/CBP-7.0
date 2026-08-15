package com.cbp7.registration.util;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public final class PublicRegistrationTimeUtil {

    public static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");
    public static final DateTimeFormatter LOG_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss 'IST'");
    public static final DateTimeFormatter USER_FACING_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a 'IST'");

    private PublicRegistrationTimeUtil() {}

    public static String nowIstString() {
        return ZonedDateTime.now(IST_ZONE).format(LOG_FORMATTER);
    }

    public static String formatToIst(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return "N/A";
        }
        // If stored as UTC or system local, format in IST
        return localDateTime.atZone(ZoneId.systemDefault()).withZoneSameInstant(IST_ZONE).format(LOG_FORMATTER);
    }

    public static String formatUserFacing(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return "N/A";
        }
        return localDateTime.atZone(ZoneId.systemDefault()).withZoneSameInstant(IST_ZONE).format(USER_FACING_FORMATTER);
    }
}

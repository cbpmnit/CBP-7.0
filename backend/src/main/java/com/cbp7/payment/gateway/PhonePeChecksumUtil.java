package com.cbp7.payment.gateway;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public final class PhonePeChecksumUtil {

    private PhonePeChecksumUtil() {
        // Private constructor to prevent instantiation
    }

    public static String generateApiChecksum(String base64Body, String apiPath, String saltKey, String saltIndex) {
        return generateSha256(base64Body + apiPath + saltKey) + "###" + saltIndex;
    }

    public static String generateCallbackChecksum(String base64Body, String saltKey, String saltIndex) {
        return generateSha256(base64Body + saltKey) + "###" + saltIndex;
    }

    private static String generateSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating SHA-256 checksum", e);
        }
    }
}

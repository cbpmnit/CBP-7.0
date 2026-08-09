package com.cbp7.common.util;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;

public final class CsvExportUtil {

    private CsvExportUtil() {
    }

    /**
     * Generates a UTF-8 CSV with BOM for universal Microsoft Excel & Google Sheets compatibility.
     *
     * @param headers List of column header names
     * @param rows    List of row values (each row is a list of strings)
     * @return byte array containing valid UTF-8 CSV data
     */
    public static byte[] generateCsv(List<String> headers, List<List<String>> rows) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        // Write UTF-8 BOM (\uFEFF) so Excel reliably detects UTF-8 characters
        try {
            out.write(new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF});
        } catch (Exception ignored) {
        }

        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            // Write Headers
            if (headers != null && !headers.isEmpty()) {
                StringBuilder headerLine = new StringBuilder();
                for (int i = 0; i < headers.size(); i++) {
                    if (i > 0) headerLine.append(",");
                    headerLine.append(formatCell(headers.get(i)));
                }
                writer.println(headerLine);
            }

            // Write Data Rows
            if (rows != null) {
                for (List<String> row : rows) {
                    StringBuilder rowLine = new StringBuilder();
                    for (int i = 0; i < row.size(); i++) {
                        if (i > 0) rowLine.append(",");
                        rowLine.append(formatCell(row.get(i)));
                    }
                    writer.println(rowLine);
                }
            }

            writer.flush();
            return out.toByteArray();
        }
    }

    public static String formatCell(String value) {
        if (value == null) {
            return "\"\"";
        }
        // Escape double quotes by doubling them
        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}

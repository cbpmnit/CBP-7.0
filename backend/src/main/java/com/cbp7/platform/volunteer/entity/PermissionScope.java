package com.cbp7.platform.volunteer.entity;

public enum PermissionScope {
    ATTENDANCE_SCAN("Scan QR Attendance"),
    ATTENDANCE_VIEW("View Attendance Logs"),
    STUDENT_VIEW("View Student Directory & Details"),
    STUDENT_EDIT("Edit Student Details"),
    PAYMENT_VIEW("View Payment Details"),
    SESSION_VIEW("View Workshop Sessions"),
    SESSION_CREATE("Create Workshop Sessions"),
    SESSION_MANAGE("Manage Workshop Sessions"),
    CERTIFICATE_VIEW("View & Issue Certificates"),
    EMAIL_SEND("Send Email Notifications");

    private final String description;

    PermissionScope(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

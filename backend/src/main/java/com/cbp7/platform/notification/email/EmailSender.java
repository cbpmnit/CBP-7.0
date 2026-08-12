package com.cbp7.platform.notification.email;

public interface EmailSender {
    void sendEmail(String recipient, String subject, String body);
}

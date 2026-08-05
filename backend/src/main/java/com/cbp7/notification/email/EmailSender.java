package com.cbp7.notification.email;

public interface EmailSender {
    void sendEmail(String recipient, String subject, String body);
}

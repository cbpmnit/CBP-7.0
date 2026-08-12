package com.cbp7.platform.notification;

import com.cbp7.platform.notification.dto.request.CreateNotificationTemplateRequest;
import com.cbp7.platform.notification.entity.NotificationChannel;
import com.cbp7.platform.notification.entity.NotificationType;
import com.cbp7.platform.notification.validation.NotificationTemplateValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class NotificationTemplateValidatorTest {

    private NotificationTemplateValidator validator;

    @BeforeEach
    void setUp() {
        validator = new NotificationTemplateValidator();
    }

    @Test
    void validateCreateTemplate_Null_ThrowsIllegalArgument() {
        assertThrows(IllegalArgumentException.class, () -> validator.validateCreateTemplate(null));
    }

    @Test
    void validateCreateTemplate_MissingName_ThrowsIllegalArgument() {
        CreateNotificationTemplateRequest req = new CreateNotificationTemplateRequest(
                "", NotificationChannel.EMAIL, NotificationType.PAYMENT_SUCCESS, "Subject", "Content", null
        );
        assertThrows(IllegalArgumentException.class, () -> validator.validateCreateTemplate(req));
    }

    @Test
    void validateCreateTemplate_MissingContent_ThrowsIllegalArgument() {
        CreateNotificationTemplateRequest req = new CreateNotificationTemplateRequest(
                "Name", NotificationChannel.EMAIL, NotificationType.PAYMENT_SUCCESS, "Subject", "", null
        );
        assertThrows(IllegalArgumentException.class, () -> validator.validateCreateTemplate(req));
    }

    @Test
    void validateCreateTemplate_Valid_Success() {
        CreateNotificationTemplateRequest req = new CreateNotificationTemplateRequest(
                "Name", NotificationChannel.EMAIL, NotificationType.PAYMENT_SUCCESS, "Subject", "Content", null
        );
        assertDoesNotThrow(() -> validator.validateCreateTemplate(req));
    }
}

ALTER TABLE notification.notification_templates
    ADD CONSTRAINT uq_notification_template_name UNIQUE (name);

ALTER TABLE notification.notification_templates
    ADD CONSTRAINT uq_notification_template_type_channel UNIQUE (type, channel);

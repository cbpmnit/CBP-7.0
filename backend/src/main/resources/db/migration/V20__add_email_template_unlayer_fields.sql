-- V20__add_email_template_unlayer_fields.sql
-- Add Unlayer design_json, status, and event_type fields to platform.notification_templates

ALTER TABLE platform.notification_templates
ADD COLUMN IF NOT EXISTS design_json TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS event_type VARCHAR(100);

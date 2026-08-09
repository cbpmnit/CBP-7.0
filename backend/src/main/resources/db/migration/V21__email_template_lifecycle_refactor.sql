-- V21__email_template_lifecycle_refactor.sql
-- Add email template lifecycle status, published_at, and design_json fields

ALTER TABLE platform.notification_templates
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'DRAFT',
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS design_json TEXT,
ADD COLUMN IF NOT EXISTS event_type VARCHAR(100);

-- Update existing active templates to DRAFT if status is null
UPDATE platform.notification_templates
SET status = 'DRAFT'
WHERE status IS NULL;

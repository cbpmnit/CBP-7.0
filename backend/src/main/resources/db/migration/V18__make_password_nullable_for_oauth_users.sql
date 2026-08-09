-- V18__make_password_nullable_for_oauth_users.sql
-- Drop NOT NULL constraint on identity.users.password to allow Google OAuth users without local passwords

ALTER TABLE identity.users ALTER COLUMN password DROP NOT NULL;

-- Seed default notification template if missing
INSERT INTO notification.notification_templates (id, name, channel, type, subject, content, created_by, created_at, updated_at)
SELECT 
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Registration Success Email',
    'EMAIL',
    'REGISTRATION_SUCCESS',
    'Welcome to CBP Portal',
    'Hello {{student_name}}, your CBP account ({{student_id}}) has been created successfully.',
    'SYSTEM',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM notification.notification_templates WHERE type = 'REGISTRATION_SUCCESS' AND channel = 'EMAIL'
);

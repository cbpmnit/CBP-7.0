-- V16__add_google_oauth_fields.sql
-- Add OAuth provider details and allow null password for Google OAuth users

ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'LOCAL';
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);
ALTER TABLE identity.users ALTER COLUMN password DROP NOT NULL;

UPDATE identity.users SET auth_provider = 'LOCAL' WHERE auth_provider IS NULL;

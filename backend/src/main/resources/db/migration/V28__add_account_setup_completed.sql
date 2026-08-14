-- V28__add_account_setup_completed.sql
-- Add account_setup_completed flag to identity.users table

ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS account_setup_completed BOOLEAN DEFAULT FALSE;

-- Set account_setup_completed = TRUE for existing users that have both student_id and password
UPDATE identity.users
SET account_setup_completed = TRUE
WHERE student_id IS NOT NULL AND student_id != '' AND password IS NOT NULL AND password != '';

-- Set account_setup_completed = FALSE for all remaining NULL entries
UPDATE identity.users
SET account_setup_completed = FALSE
WHERE account_setup_completed IS NULL;

-- Enforce NOT NULL constraint
ALTER TABLE identity.users ALTER COLUMN account_setup_completed SET NOT NULL;

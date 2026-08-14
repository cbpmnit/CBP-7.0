-- V29__fix_account_setup_completed_not_null.sql
-- Ensure identity.users.account_setup_completed has NO NULL values and enforces NOT NULL constraint

UPDATE identity.users
SET account_setup_completed = TRUE
WHERE (account_setup_completed IS NULL OR account_setup_completed = FALSE)
  AND student_id IS NOT NULL AND student_id != '' 
  AND password IS NOT NULL AND password != '';

UPDATE identity.users
SET account_setup_completed = FALSE
WHERE account_setup_completed IS NULL;

ALTER TABLE identity.users ALTER COLUMN account_setup_completed SET DEFAULT FALSE;
ALTER TABLE identity.users ALTER COLUMN account_setup_completed SET NOT NULL;

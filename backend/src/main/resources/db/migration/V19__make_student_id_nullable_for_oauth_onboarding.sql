-- V19__make_student_id_nullable_for_oauth_onboarding.sql
-- Allow NULL student_id for new Google OAuth users prior to profile setup completion

ALTER TABLE identity.users ALTER COLUMN student_id DROP NOT NULL;

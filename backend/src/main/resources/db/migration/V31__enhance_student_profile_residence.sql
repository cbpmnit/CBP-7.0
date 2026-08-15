-- V31__enhance_student_profile_residence.sql
-- Enhance student profile with student_type enum, address, and hostel_number columns while backfilling existing hosteller data safely.

ALTER TABLE identity.user_profiles
    ADD COLUMN IF NOT EXISTS student_type VARCHAR(30),
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS hostel_number VARCHAR(50);

-- Backfill student_type based on existing hosteller boolean
UPDATE identity.user_profiles
SET student_type = CASE
    WHEN hosteller = TRUE THEN 'HOSTELLER'
    ELSE 'DAY_SCHOLAR'
END
WHERE student_type IS NULL;

-- Set default for student_type and enforce NOT NULL constraint
ALTER TABLE identity.user_profiles
    ALTER COLUMN student_type SET DEFAULT 'DAY_SCHOLAR',
    ALTER COLUMN student_type SET NOT NULL;

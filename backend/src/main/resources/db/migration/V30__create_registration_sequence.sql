-- V30__create_registration_sequence.sql
-- Create database sequence for concurrent-safe CBP registration ID generation

CREATE SEQUENCE IF NOT EXISTS program.registration_sequence
    START WITH 1
    INCREMENT BY 1;

-- Initialize sequence start position past any existing registration IDs
SELECT setval(
    'program.registration_sequence',
    GREATEST(
        COALESCE(
            (
                SELECT MAX(
                    CASE 
                        WHEN registration_id ~ '^CBP7[0-9]+$' 
                        THEN CAST(SUBSTRING(registration_id FROM 5) AS BIGINT)
                        ELSE 0 
                    END
                ) 
                FROM program.registrations
            ), 
            0
        ) + 1, 
        1
    ),
    false
);

-- Ensure UNIQUE constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uk_program_registrations_user_id'
    ) THEN
        ALTER TABLE program.registrations ADD CONSTRAINT uk_program_registrations_user_id UNIQUE (user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uk_program_registrations_registration_id'
    ) THEN
        ALTER TABLE program.registrations ADD CONSTRAINT uk_program_registrations_registration_id UNIQUE (registration_id);
    END IF;
END $$;

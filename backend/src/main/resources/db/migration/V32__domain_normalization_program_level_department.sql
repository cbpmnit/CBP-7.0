-- V32__domain_normalization_program_level_department.sql
-- Complete domain normalization for student academic (program_level, department) and residence fields across identity and program schemas.

-- 1. Normalize identity.user_profiles
DO $$
BEGIN
    -- Rename course to program_level if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'identity' AND table_name = 'user_profiles' AND column_name = 'course') THEN
        ALTER TABLE identity.user_profiles RENAME COLUMN course TO program_level;
    END IF;

    -- Rename branch to department if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'identity' AND table_name = 'user_profiles' AND column_name = 'branch') THEN
        ALTER TABLE identity.user_profiles RENAME COLUMN branch TO department;
    END IF;

    -- Ensure type VARCHAR(100) on program_level and department
    ALTER TABLE identity.user_profiles ALTER COLUMN program_level TYPE VARCHAR(100);
    ALTER TABLE identity.user_profiles ALTER COLUMN department TYPE VARCHAR(255);
END $$;

-- Backfill identity.user_profiles values
UPDATE identity.user_profiles
SET program_level = CASE
    WHEN UPPER(program_level) IN ('BTECH', 'UG', 'UNDERGRADUATE') THEN 'UNDERGRADUATE'
    WHEN UPPER(program_level) IN ('MTECH', 'MBA', 'PG', 'POSTGRADUATE') THEN 'POSTGRADUATE'
    WHEN UPPER(program_level) IN ('PHD', 'RESEARCH') THEN 'RESEARCH'
    ELSE 'UNDERGRADUATE'
END;

UPDATE identity.user_profiles
SET department = CASE
    WHEN department = 'COMPUTER_SCIENCE_ENGINEERING' THEN 'Computer Science and Engineering'
    WHEN department = 'ARTIFICIAL_INTELLIGENCE_DATA_SCIENCE' THEN 'Artificial Intelligence and Data Science'
    WHEN department = 'ELECTRONICS_COMMUNICATION' THEN 'Electronics and Communication Engineering'
    WHEN department = 'ELECTRICAL_ENGINEERING' THEN 'Electrical Engineering'
    WHEN department = 'MECHANICAL_ENGINEERING' THEN 'Mechanical Engineering'
    WHEN department = 'CIVIL_ENGINEERING' THEN 'Civil Engineering'
    WHEN department = 'CHEMICAL_ENGINEERING' THEN 'Chemical Engineering'
    WHEN department = 'METALLURGICAL_ENGINEERING' THEN 'Metallurgical and Materials Engineering'
    WHEN department = 'MATERIALS_ENGINEERING' THEN 'Materials Engineering'
    WHEN department = 'ARCHITECTURE' THEN 'Architecture'
    WHEN department = 'MANAGEMENT_STUDIES' THEN 'Management Studies'
    WHEN department IS NULL OR department = '' OR department = 'OTHER' THEN 'Computer Science and Engineering'
    ELSE REPLACE(department, '_', ' ')
END;

-- 2. Normalize program.registrations
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'program' AND table_name = 'registrations') THEN
        -- Rename course to program_level
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'program' AND table_name = 'registrations' AND column_name = 'course') THEN
            ALTER TABLE program.registrations RENAME COLUMN course TO program_level;
        END IF;

        -- Rename branch to department
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'program' AND table_name = 'registrations' AND column_name = 'branch') THEN
            ALTER TABLE program.registrations RENAME COLUMN branch TO department;
        END IF;

        -- Add student_type, address, hostel_number if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'program' AND table_name = 'registrations' AND column_name = 'student_type') THEN
            ALTER TABLE program.registrations ADD COLUMN student_type VARCHAR(30);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'program' AND table_name = 'registrations' AND column_name = 'address') THEN
            ALTER TABLE program.registrations ADD COLUMN address TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'program' AND table_name = 'registrations' AND column_name = 'hostel_number') THEN
            ALTER TABLE program.registrations ADD COLUMN hostel_number VARCHAR(50);
        END IF;
    END IF;
END $$;

-- Backfill program.registrations values if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'program' AND table_name = 'registrations') THEN
        UPDATE program.registrations
        SET program_level = CASE
            WHEN UPPER(program_level) IN ('BTECH', 'UG', 'UNDERGRADUATE') THEN 'UNDERGRADUATE'
            WHEN UPPER(program_level) IN ('MTECH', 'MBA', 'PG', 'POSTGRADUATE') THEN 'POSTGRADUATE'
            WHEN UPPER(program_level) IN ('PHD', 'RESEARCH') THEN 'RESEARCH'
            ELSE 'UNDERGRADUATE'
        END;

        UPDATE program.registrations
        SET student_type = CASE
            WHEN hosteller = TRUE THEN 'HOSTELLER'
            ELSE 'DAY_SCHOLAR'
        END
        WHERE student_type IS NULL;
    END IF;
END $$;

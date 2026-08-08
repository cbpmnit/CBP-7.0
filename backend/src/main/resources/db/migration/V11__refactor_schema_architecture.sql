-- V11__refactor_schema_architecture.sql
-- Refactor database schema architecture into 3 target schemas: identity, program, platform

-- 1. Create Target Schemas
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS program;
CREATE SCHEMA IF NOT EXISTS platform;

-- 2. Move Existing Tables to Target Schemas (Safe Alter Table)
DO $$
BEGIN
    -- Move users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'cbp' AND table_name = 'users') THEN
        ALTER TABLE cbp.users SET SCHEMA identity;
    END IF;

    -- Move user_profiles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'profile' AND table_name = 'user_profiles') THEN
        ALTER TABLE profile.user_profiles SET SCHEMA identity;
    END IF;

    -- Move profile_completion
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'profile' AND table_name = 'profile_completion') THEN
        ALTER TABLE profile.profile_completion SET SCHEMA identity;
    END IF;

    -- Move registrations
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'cbp' AND table_name = 'registrations') THEN
        ALTER TABLE cbp.registrations SET SCHEMA program;
    END IF;

    -- Move payments
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'payment' AND table_name = 'payments') THEN
        ALTER TABLE payment.payments SET SCHEMA program;
    END IF;

    -- Move certificates
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'certificate' AND table_name = 'certificates') THEN
        ALTER TABLE certificate.certificates SET SCHEMA program;
    END IF;

    -- Move notification_templates
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'notification' AND table_name = 'notification_templates') THEN
        ALTER TABLE notification.notification_templates SET SCHEMA platform;
    END IF;
END $$;

-- 3. Create Attendance Sessions Table (program.attendance_sessions)
CREATE TABLE IF NOT EXISTS program.attendance_sessions (
    id UUID PRIMARY KEY,
    day_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    session_date DATE NOT NULL,
    start_time TIME WITHOUT TIME ZONE,
    end_time TIME WITHOUT TIME ZONE,
    venue VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'UPCOMING',
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Re-create Session-Based Attendance QR Codes (program.attendance_qr_codes)
DROP TABLE IF EXISTS attendance.qr_codes CASCADE;
DROP TABLE IF EXISTS program.attendance_qr_codes CASCADE;

CREATE TABLE IF NOT EXISTS program.attendance_qr_codes (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES program.attendance_sessions(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    generated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITHOUT TIME ZONE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Re-create Session-Based Attendance Records (program.attendance_records)
DROP TABLE IF EXISTS attendance.attendance_records CASCADE;
DROP TABLE IF EXISTS program.attendance_records CASCADE;

CREATE TABLE IF NOT EXISTS program.attendance_records (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES program.attendance_sessions(id) ON DELETE CASCADE,
    student_id VARCHAR(255) NOT NULL,
    marked_by VARCHAR(255) NOT NULL,
    marked_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'PRESENT',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_session_student UNIQUE (session_id, student_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON program.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON program.attendance_records(student_id);

-- 6. Clean up old schemas if empty
DROP SCHEMA IF EXISTS cbp CASCADE;
DROP SCHEMA IF EXISTS profile CASCADE;
DROP SCHEMA IF EXISTS payment CASCADE;
DROP SCHEMA IF EXISTS attendance CASCADE;
DROP SCHEMA IF EXISTS certificate CASCADE;
DROP SCHEMA IF EXISTS notification CASCADE;

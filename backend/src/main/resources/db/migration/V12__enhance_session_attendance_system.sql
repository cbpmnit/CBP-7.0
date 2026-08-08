-- V12__enhance_session_attendance_system.sql
-- Enhance program.attendance_sessions and add indexes for attendance_records

ALTER TABLE program.attendance_sessions
ADD COLUMN IF NOT EXISTS visibility BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_attendance_records_session_id ON program.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id ON program.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_marked_at ON program.attendance_records(marked_at);

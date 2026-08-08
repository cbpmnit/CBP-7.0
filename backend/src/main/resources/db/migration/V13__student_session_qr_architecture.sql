-- V13__student_session_qr_architecture.sql
-- Refactor attendance QR codes for Student-Specific Session QR Architecture

ALTER TABLE program.attendance_qr_codes
ADD COLUMN IF NOT EXISTS student_id VARCHAR(50);

ALTER TABLE program.attendance_records
ADD COLUMN IF NOT EXISTS qr_code_id UUID;

CREATE INDEX IF NOT EXISTS idx_attendance_qr_session_student ON program.attendance_qr_codes(session_id, student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_qr_code_id ON program.attendance_records(qr_code_id);

-- V26__fix_attendance_qr_unique_active_index.sql
-- Clean up historical duplicate active QR records and create partial unique index

-- 1. Deactivate older duplicate active QR codes for each (session_id, student_id)
UPDATE program.attendance_qr_codes
SET active = false
WHERE active = true
  AND id NOT IN (
    SELECT DISTINCT ON (session_id, LOWER(student_id)) id
    FROM program.attendance_qr_codes
    WHERE active = true
    ORDER BY session_id, LOWER(student_id), created_at DESC
  );

-- 2. Create partial unique index guaranteeing at most ONE active QR per (session_id, student_id)
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_qr_per_session_student
ON program.attendance_qr_codes(session_id, LOWER(student_id))
WHERE active = true;

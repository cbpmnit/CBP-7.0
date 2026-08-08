CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance.attendance_records(attendance_date);

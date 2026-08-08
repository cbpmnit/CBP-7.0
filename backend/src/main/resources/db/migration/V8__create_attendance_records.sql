CREATE TABLE IF NOT EXISTS attendance.attendance_records (
    id UUID PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    qr_code_id UUID NOT NULL,
    marked_by VARCHAR(255) NOT NULL,
    attendance_date DATE NOT NULL,
    attendance_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT uq_attendance_student_date UNIQUE (student_id, attendance_date)
);

CREATE SCHEMA IF NOT EXISTS certificate;

CREATE TABLE IF NOT EXISTS certificate.certificates (
    id UUID PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    certificate_number VARCHAR(255) NOT NULL UNIQUE,
    certificate_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    file_url VARCHAR(500),
    generated_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

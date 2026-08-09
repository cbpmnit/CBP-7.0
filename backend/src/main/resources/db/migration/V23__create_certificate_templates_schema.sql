-- V23__create_certificate_templates_schema.sql
-- Create certificate_templates table and link with certificates

CREATE TABLE IF NOT EXISTS program.certificate_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    background_url TEXT,
    field_configuration_json TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE program.certificates
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES program.certificate_templates(id) ON DELETE SET NULL;

-- Seed default published Certificate Template for CBP 7.0
INSERT INTO program.certificate_templates (name, background_url, field_configuration_json, status)
VALUES (
    'Official CBP 7.0 Completion Certificate',
    '/certificates/certificate-bg.svg',
    '{"studentName":{"x":500,"y":330,"fontFamily":"Great Vibes","fontSize":42,"fontWeight":"bold","alignment":"center","color":"#1e293b"},"studentId":{"x":500,"y":385,"fontFamily":"Inter","fontSize":16,"fontWeight":"normal","alignment":"center","color":"#64748b"}}',
    'PUBLISHED'
)
ON CONFLICT DO NOTHING;

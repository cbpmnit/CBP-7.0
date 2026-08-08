-- V14__admin_preferences_schema.sql
-- Create admin preferences table for persisting UI column customizations

CREATE TABLE IF NOT EXISTS program.admin_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id VARCHAR(50) NOT NULL UNIQUE,
    visible_columns TEXT NOT NULL DEFAULT '{"showEmail":true,"showPhone":true,"showBranch":true,"showPayment":true,"showAttendance":true,"showRegistration":true}',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_preferences_admin_id ON program.admin_preferences(admin_id);

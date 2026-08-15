-- V34__create_public_registration_audit_logs.sql
-- Create public registration audit log table and account_verified column

ALTER TABLE registration.public_registrations 
ADD COLUMN IF NOT EXISTS account_verified BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS registration.public_registration_audit_logs (
    id UUID PRIMARY KEY,
    registration_id UUID,
    payment_transaction_id UUID,
    merchant_order_id VARCHAR(100),
    event_type VARCHAR(100) NOT NULL,
    message VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pub_reg_audit_reg_id ON registration.public_registration_audit_logs(registration_id);
CREATE INDEX IF NOT EXISTS idx_pub_reg_audit_order_id ON registration.public_registration_audit_logs(merchant_order_id);
CREATE INDEX IF NOT EXISTS idx_pub_reg_audit_created_at ON registration.public_registration_audit_logs(created_at);

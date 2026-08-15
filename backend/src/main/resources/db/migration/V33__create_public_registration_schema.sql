-- V33__create_public_registration_schema.sql
-- Create independent registration schema and tables for unauthenticated public registration platform

CREATE SCHEMA IF NOT EXISTS registration;

-- Table: registration.public_registrations
CREATE TABLE IF NOT EXISTS registration.public_registrations (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    student_id VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    program_level VARCHAR(50) NOT NULL,
    department VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    student_type VARCHAR(50) NOT NULL,
    address TEXT,
    hostel_number VARCHAR(100),
    room_number VARCHAR(100),
    expectations TEXT,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_transaction_id VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_public_registrations_email ON registration.public_registrations(email);
CREATE INDEX IF NOT EXISTS idx_public_registrations_student_id ON registration.public_registrations(student_id);

-- Table: registration.payment_transactions
CREATE TABLE IF NOT EXISTS registration.payment_transactions (
    id UUID PRIMARY KEY,
    registration_id UUID NOT NULL REFERENCES registration.public_registrations(id) ON DELETE CASCADE,
    merchant_order_id VARCHAR(255) NOT NULL UNIQUE,
    gateway_transaction_id VARCHAR(255),
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_reg_id ON registration.payment_transactions(registration_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON registration.payment_transactions(merchant_order_id);

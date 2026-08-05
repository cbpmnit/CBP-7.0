CREATE SCHEMA IF NOT EXISTS payment;

CREATE TABLE IF NOT EXISTS payment.payments (
    id UUID PRIMARY KEY,
    registration_id UUID NOT NULL,
    user_id UUID NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

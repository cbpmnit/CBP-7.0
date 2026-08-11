-- V25__add_payment_reconciliation_indexes.sql
-- Add indexes on payments table for optimizing status reconciliation and user queries
CREATE INDEX IF NOT EXISTS idx_payments_payment_status ON program.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON program.payments(user_id);

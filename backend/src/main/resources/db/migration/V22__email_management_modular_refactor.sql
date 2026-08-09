-- V22__email_management_modular_refactor.sql
-- Create modular tables for Email Blocks, Operations, and Delivery Logs

CREATE TABLE IF NOT EXISTS platform.email_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    content TEXT,
    html_snippet TEXT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform.email_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    template_id UUID REFERENCES platform.notification_templates(id) ON DELETE SET NULL,
    recipient_type VARCHAR(50) NOT NULL,
    filters TEXT,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    trigger_type VARCHAR(50) DEFAULT 'MANUAL',
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    scheduled_at TIMESTAMP WITHOUT TIME ZONE,
    executed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES platform.email_operations(id) ON DELETE SET NULL,
    template_id UUID,
    template_name VARCHAR(200),
    recipient VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SENT',
    sent_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON platform.email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON platform.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON platform.email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_operations_status ON platform.email_operations(status);

-- Seed Default CBP Operational Blocks
INSERT INTO platform.email_blocks (name, category, content, html_snippet, enabled)
VALUES
(
    'Student Information Block',
    'STUDENT',
    'Displays full student profile dossier, ID, and branch details',
    '<div style="background-color: #f8fafc; border-radius: 8px; padding: 18px; margin: 16px 0; border: 1px solid #e2e8f0;"><p style="margin: 0; font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Participant Profile</p><h4 style="margin: 6px 0 0 0; font-size: 16px; color: #0f172a; font-weight: bold;">{{studentName}}</h4><p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">Student ID: <strong>{{studentId}}</strong> &bull; Email: {{email}}</p><p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Phone: {{phoneNumber}}</p></div>',
    TRUE
),
(
    'Payment Information Block',
    'PAYMENT',
    'Receipt card showing fee amount, PhonePe reference, and verification timestamp',
    '<div style="background-color: #ecfdf5; border-radius: 8px; padding: 18px; margin: 16px 0; border: 1px solid #a7f3d0;"><p style="margin: 0; font-size: 11px; font-weight: bold; color: #065f46; text-transform: uppercase;">Payment Receipt</p><p style="margin: 6px 0 0 0; font-size: 15px; font-weight: bold; color: #064e3b;">Amount Paid: INR {{amount}}</p><p style="margin: 4px 0 0 0; font-size: 12px; color: #047857;">Transaction Ref: {{transactionId}} &bull; Status: {{paymentStatus}}</p><p style="margin: 2px 0 0 0; font-size: 11px; color: #059669;">Verified: {{paidAt}}</p></div>',
    TRUE
),
(
    'Attendance QR Block',
    'ATTENDANCE',
    'Secure gate security pass block with encrypted barcode and venue info',
    '<div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #cbd5e1; text-align: center;"><p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #0f172a; text-transform: uppercase;">Gate Security Entry Pass</p><img src="{{qrCode}}" alt="Gate Entry QR" width="160" height="160" style="display: block; margin: 12px auto; border-radius: 8px;" /><p style="margin: 8px 0 0 0; font-size: 14px; font-weight: bold; color: #0f172a;">{{sessionName}}</p><p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Venue: {{venue}} &bull; Date: {{sessionDate}}</p></div>',
    TRUE
),
(
    'Certificate Block',
    'CERTIFICATE',
    'Credential verification card with serial ID and direct PDF download link',
    '<div style="background-color: #faf5ff; border-radius: 8px; padding: 18px; margin: 16px 0; border: 1px solid #e9d5ff; text-align: center;"><p style="margin: 0; font-size: 11px; font-weight: bold; color: #6b21a8; text-transform: uppercase;">Official Verified Credential</p><p style="margin: 6px 0 0 0; font-size: 14px; font-weight: bold; color: #581c87;">Credential ID: {{certificateNumber}}</p><p style="margin: 4px 0 12px 0; font-size: 12px; color: #7e22ce;">Issued on: {{issueDate}}</p><a href="{{certificateUrl}}" style="display: inline-block; padding: 8px 20px; background-color: #7e22ce; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold;">Download Certificate</a></div>',
    TRUE
)
ON CONFLICT DO NOTHING;

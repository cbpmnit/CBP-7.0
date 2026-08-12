-- V27__centralized_email_template_engine.sql
-- Migration for Centralized Email Template Engine and System Event Seed Data

-- 1. Ensure platform.notification_templates has required columns and non-null defaults
ALTER TABLE platform.notification_templates 
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- 2. Ensure platform.email_logs supports transactional event logging
ALTER TABLE platform.email_logs
    ADD COLUMN IF NOT EXISTS event_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS subject VARCHAR(255);

-- Create index for event_type lookups on email_logs
CREATE INDEX IF NOT EXISTS idx_email_logs_event_type ON platform.email_logs(event_type);

-- 3. Seed Production ACTIVE Templates for All System Events
INSERT INTO platform.notification_templates (
    id, name, channel, type, event_type, subject, content, variables, status, published_at, created_by, created_at, updated_at
) VALUES
(
    'a1b2c3d4-0001-4000-8000-000000000001',
    'Registration Success Welcome Email',
    'EMAIL',
    'REGISTRATION_SUCCESS',
    'REGISTRATION_SUCCESS',
    'Welcome to CBP 7.0 - Registration Confirmed',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0f172a; margin: 0; font-size: 24px;">Registration Confirmed!</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">CBP 7.0 Soft Skills Program - MNIT Jaipur</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Dear <strong>{{studentName}}</strong>,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Congratulations! Your registration for the Capacity Building Program (CBP 7.0) has been successfully recorded.</p>
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Student ID:</strong> {{studentId}}</p>
            <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Email:</strong> {{studentEmail}}</p>
            <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Registration Ref:</strong> {{registrationId}}</p>
        </div>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">Please complete your fee payment in the portal to receive your gate pass QR code.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Organizing Committee, CBP 7.0 &bull; MNIT Jaipur</p>
    </div>',
    'studentName,studentId,studentEmail,registrationId',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    'SYSTEM',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'a1b2c3d4-0002-4000-8000-000000000002',
    'Payment Success Receipt Email',
    'EMAIL',
    'PAYMENT_SUCCESS',
    'PAYMENT_SUCCESS',
    'Payment Receipt - CBP 7.0 Registration Fee',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #065f46; margin: 0; font-size: 24px;">Payment Received</h1>
            <p style="color: #059669; font-size: 14px; margin-top: 4px;">Official Fee Receipt &bull; CBP 7.0</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Dear <strong>{{studentName}}</strong>,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Your registration fee payment has been successfully verified via PhonePe Gateway.</p>
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 18px; margin: 20px 0;">
            <p style="margin: 4px 0; color: #065f46; font-size: 15px; font-weight: bold;">Amount Paid: INR {{amount}}</p>
            <p style="margin: 4px 0; color: #047857; font-size: 14px;"><strong>Transaction ID:</strong> {{paymentId}}</p>
            <p style="margin: 4px 0; color: #047857; font-size: 14px;"><strong>Student ID:</strong> {{studentId}}</p>
            <p style="margin: 4px 0; color: #047857; font-size: 14px;"><strong>Status:</strong> COMPLETED</p>
        </div>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">Your attendance QR gate pass is now unlocked in your student dashboard.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Financial Operations &bull; CBP 7.0 MNIT Jaipur</p>
    </div>',
    'studentName,studentId,paymentId,amount,studentEmail',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    'SYSTEM',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'a1b2c3d4-0003-4000-8000-000000000003',
    'Payment Failure Alert Email',
    'EMAIL',
    'PAYMENT_FAILED',
    'PAYMENT_FAILED',
    'Payment Failed - Action Required for CBP 7.0',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #fca5a5; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #991b1b; margin: 0; font-size: 24px;">Payment Transaction Failed</h1>
            <p style="color: #dc2626; font-size: 14px; margin-top: 4px;">CBP 7.0 Registration Fee</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Dear <strong>{{studentName}}</strong>,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">We were unable to process your payment transaction (Ref: {{paymentId}}). Any deducted amount will be automatically refunded by PhonePe within 3-5 working days.</p>
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0; color: #991b1b; font-size: 14px;"><strong>Student ID:</strong> {{studentId}}</p>
            <p style="margin: 4px 0; color: #991b1b; font-size: 14px;"><strong>Amount:</strong> INR {{amount}}</p>
        </div>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">Please log into your student dashboard to retry the transaction.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Finance Desk &bull; CBP 7.0 MNIT Jaipur</p>
    </div>',
    'studentName,studentId,paymentId,amount,studentEmail',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    'SYSTEM',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'a1b2c3d4-0004-4000-8000-000000000004',
    'Attendance QR Gate Security Pass Email',
    'EMAIL',
    'ATTENDANCE_QR_GENERATED',
    'ATTENDANCE_QR_GENERATED',
    'Your CBP 7.0 Gate Security Entry Pass',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0f172a; margin: 0; font-size: 24px;">Gate Security QR Pass</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Soft Skills Workshop Access</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello <strong>{{studentName}}</strong> (ID: {{studentId}}),</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Present your personal QR gate pass below at the auditorium scanner gate for entry:</p>
        <div style="background-color: #f1f5f9; border: 1px solid #94a3b8; border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 12px 0; font-weight: bold; color: #0f172a;">TOKEN: {{qrToken}}</p>
            <p style="margin: 8px 0 0 0; color: #475569; font-size: 13px;">Venue: VLTC Main Auditorium, MNIT Jaipur</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Security Operations &bull; CBP 7.0 MNIT Jaipur</p>
    </div>',
    'studentName,studentId,studentEmail,qrToken',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    'SYSTEM',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'a1b2c3d4-0005-4000-8000-000000000005',
    'Certificate Release Email',
    'EMAIL',
    'CERTIFICATE_READY',
    'CERTIFICATE_ISSUED',
    'Congratulations! Your CBP 7.0 Completion Certificate is Ready',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e9d5ff; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #581c87; margin: 0; font-size: 24px;">Certificate Issued</h1>
            <p style="color: #7e22ce; font-size: 14px; margin-top: 4px;">MNIT Soft Skills Development Program</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Dear <strong>{{studentName}}</strong>,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Congratulations on completing the required attendance for the CBP 7.0 Soft Skills Development Program. Your official verified certificate of participation is now available.</p>
        <div style="background-color: #faf5ff; border: 1px solid #d8b4fe; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 12px 0; color: #581c87; font-weight: bold; font-size: 14px;">Credential Ref: {{studentId}}</p>
            <a href="{{certificateUrl}}" style="display: inline-block; padding: 10px 24px; background-color: #7e22ce; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Download PDF Certificate</a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Academic Credentials Desk &bull; MNIT Jaipur</p>
    </div>',
    'studentName,studentId,studentEmail,certificateUrl',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    'SYSTEM',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'a1b2c3d4-0006-4000-8000-000000000006',
    'Volunteer Invitation Email',
    'EMAIL',
    NULL,
    'VOLUNTEER_INVITATION',
    'Invitation: CBP 7.0 Volunteer Team - MNIT Jaipur',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0f172a; margin: 0; font-size: 24px;">Volunteer Team Invitation</h1>
            <p style="color: #0284c7; font-size: 14px; margin-top: 4px;">CBP 7.0 Organizing Committee</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello <strong>{{studentName}}</strong>,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">You have been invited to serve as an operational volunteer for the CBP 7.0 Soft Skills Development Program at MNIT Jaipur.</p>
        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 12px 0; color: #0369a1; font-size: 14px;">Please activate your volunteer account and set your password:</p>
            <a href="{{activationLink}}" style="display: inline-block; padding: 10px 24px; background-color: #0284c7; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Activate Volunteer Account</a>
            <p style="margin: 12px 0 0 0; color: #64748b; font-size: 12px;">This invitation link expires in 7 days.</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Program Administration &bull; MNIT Jaipur</p>
    </div>',
    'studentName,activationLink,email',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    'SYSTEM',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'a1b2c3d4-0007-4000-8000-000000000007',
    'Volunteer Privileges Granted Email',
    'EMAIL',
    NULL,
    'VOLUNTEER_ASSIGNED',
    'CBP 7.0 Volunteer Privileges Granted',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0f172a; margin: 0; font-size: 24px;">Volunteer Access Granted</h1>
            <p style="color: #059669; font-size: 14px; margin-top: 4px;">CBP 7.0 Operations</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello <strong>{{studentName}}</strong>,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Your existing CBP 7.0 student account has been granted volunteer privileges.</p>
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; color: #0f172a; font-weight: bold; font-size: 14px;">Assigned Scope Permissions:</p>
            <pre style="margin: 0; color: #475569; font-size: 13px; font-family: monospace;">{{permissionsList}}</pre>
        </div>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">Log into your portal to access volunteer modules: <a href="{{portalUrl}}/login" style="color: #0284c7;">{{portalUrl}}/login</a></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Program Administration &bull; MNIT Jaipur</p>
    </div>',
    'studentName,permissionsList,portalUrl,email',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    'SYSTEM',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'a1b2c3d4-0008-4000-8000-000000000008',
    'Volunteer Permissions Updated Email',
    'EMAIL',
    NULL,
    'VOLUNTEER_PERMISSIONS_UPDATED',
    'CBP 7.0 Volunteer Operational Permissions Updated',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0f172a; margin: 0; font-size: 24px;">Permissions Updated</h1>
            <p style="color: #0284c7; font-size: 14px; margin-top: 4px;">CBP 7.0 Volunteer Roster</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello <strong>{{studentName}}</strong>,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Your operational volunteer scopes have been updated by the administrator:</p>
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <pre style="margin: 0; color: #475569; font-size: 13px; font-family: monospace;">{{permissionsList}}</pre>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Program Administration &bull; MNIT Jaipur</p>
    </div>',
    'studentName,permissionsList,portalUrl,email',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    'SYSTEM',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'a1b2c3d4-0009-4000-8000-000000000009',
    'Volunteer Access Status Notice',
    'EMAIL',
    NULL,
    'VOLUNTEER_ACCESS_REVOKED',
    'CBP 7.0 Volunteer Access Status Update',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0f172a; margin: 0; font-size: 24px;">Volunteer Status Notice</h1>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello <strong>{{studentName}}</strong>,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Your volunteer operational access permissions for CBP 7.0 have been temporarily deactivated by the program administration.</p>
        <p style="color: #64748b; font-size: 13px; line-height: 1.6;">If you believe this is in error, please contact the CBP 7.0 organizing committee.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Program Administration &bull; MNIT Jaipur</p>
    </div>',
    'studentName,email',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    'SYSTEM',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    content = EXCLUDED.content,
    subject = EXCLUDED.subject,
    updated_at = CURRENT_TIMESTAMP;

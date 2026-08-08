CREATE TABLE IF NOT EXISTS identity.volunteer_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_volunteer_invitations_email ON identity.volunteer_invitations(email);
CREATE INDEX IF NOT EXISTS idx_volunteer_invitations_token ON identity.volunteer_invitations(invitation_token);

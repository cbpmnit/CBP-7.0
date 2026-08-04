CREATE SCHEMA IF NOT EXISTS profile;

CREATE TABLE IF NOT EXISTS profile.user_profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES cbp.users(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    last_name VARCHAR(255) NOT NULL,
    profile_photo_url VARCHAR(500),
    gender VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    phone_number VARCHAR(20) NOT NULL,
    same_as_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
    whatsapp_number VARCHAR(20),
    institute VARCHAR(255) NOT NULL DEFAULT 'MNIT Jaipur',
    course VARCHAR(100) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    section VARCHAR(50),
    hosteller BOOLEAN NOT NULL DEFAULT FALSE,
    room_number VARCHAR(50),
    city VARCHAR(255),
    state VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS profile.profile_completion (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES cbp.users(id) ON DELETE CASCADE,
    profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    last_completed_step VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

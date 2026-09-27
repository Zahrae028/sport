DROP TABLE IF EXISTS waiting_list CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS families CASCADE;
DROP TABLE IF EXISTS associations CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;

CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    erp_capacity INT NOT NULL CHECK (erp_capacity > 0)
);

CREATE TABLE associations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(120)
);

CREATE TABLE families (
    id SERIAL PRIMARY KEY,
    family_name VARCHAR(100) NOT NULL,
    family_quotient NUMERIC(10,2) NOT NULL DEFAULT 1000 CHECK (family_quotient >= 0)
);

CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    birth_date DATE NOT NULL,
    resident BOOLEAN NOT NULL DEFAULT TRUE,
    family_id INT REFERENCES families(id) ON DELETE SET NULL,
    medical_certificate_date DATE
);

CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    association_id INT REFERENCES associations(id) ON DELETE SET NULL,
    facility_id INT NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
    day_of_week VARCHAR(15) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity INT NOT NULL CHECK (max_capacity > 0),
    base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
    target_category VARCHAR(30) NOT NULL DEFAULT 'Tous publics',
    special_risk BOOLEAN NOT NULL DEFAULT FALSE,
    zone VARCHAR(30) NOT NULL DEFAULT 'full',
    CHECK (end_time > start_time)
);

CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    final_price NUMERIC(10,2) NOT NULL CHECK (final_price >= 15),
    status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
    medical_status VARCHAR(30) NOT NULL DEFAULT 'compliant',
    payment_mode INT NOT NULL DEFAULT 1 CHECK (payment_mode IN (1,3)),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(member_id, activity_id)
);

CREATE TABLE waiting_list (
    id SERIAL PRIMARY KEY,
    activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    priority_score INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'waiting',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deadline_confirmation TIMESTAMP,
    UNIQUE(activity_id, member_id)
);

CREATE INDEX idx_activities_facility_day ON activities(facility_id, day_of_week);
CREATE INDEX idx_registrations_activity_status ON registrations(activity_id, status);
CREATE INDEX idx_waiting_activity_status ON waiting_list(activity_id, status);

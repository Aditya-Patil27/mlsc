-- ============================================================================
-- CampusChain — Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up all tables
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
  prn TEXT,
  department TEXT,
  year INTEGER,
  wallet_address TEXT NOT NULL,
  employee_id TEXT,
  password_hash TEXT NOT NULL,
  device_fingerprint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- ATTENDANCE SESSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  faculty_id UUID NOT NULL REFERENCES users(id),
  room TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  qr_nonce TEXT NOT NULL,
  geofence_lat DOUBLE PRECISION NOT NULL,
  geofence_lng DOUBLE PRECISION NOT NULL,
  geofence_radius INTEGER NOT NULL DEFAULT 100,
  allowed_bssids TEXT[] DEFAULT '{}',
  bluetooth_beacon TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_faculty ON attendance_sessions(faculty_id);
CREATE INDEX idx_sessions_status ON attendance_sessions(status);

-- ============================================================================
-- ATTENDANCE RECORDS
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES attendance_sessions(id),
  student_id UUID NOT NULL REFERENCES users(id),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  gps_lat DOUBLE PRECISION NOT NULL,
  gps_lng DOUBLE PRECISION NOT NULL,
  gps_accuracy DOUBLE PRECISION NOT NULL,
  within_geofence BOOLEAN NOT NULL,
  wifi_bssid TEXT,
  wifi_verified BOOLEAN NOT NULL DEFAULT FALSE,
  device_fingerprint TEXT NOT NULL,
  device_is_emulator BOOLEAN NOT NULL DEFAULT FALSE,
  time_within_window BOOLEAN NOT NULL DEFAULT TRUE,
  bluetooth_detected BOOLEAN NOT NULL DEFAULT FALSE,
  ai_status TEXT NOT NULL DEFAULT 'legitimate' CHECK (ai_status IN ('legitimate', 'flagged', 'suspicious')),
  ai_score INTEGER NOT NULL DEFAULT 0,
  ai_reason TEXT,
  tx_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'late', 'flagged', 'absent')),

  UNIQUE(session_id, student_id)
);

CREATE INDEX idx_records_session ON attendance_records(session_id);
CREATE INDEX idx_records_student ON attendance_records(student_id);
CREATE INDEX idx_records_status ON attendance_records(status);

-- ============================================================================
-- HEALTH CREDENTIALS
-- ============================================================================
CREATE TABLE IF NOT EXISTS health_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id),
  issuer_id TEXT NOT NULL,
  issuer_name TEXT NOT NULL,
  issued_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_from TIMESTAMPTZ NOT NULL,
  valid_to TIMESTAMPTZ NOT NULL,
  credential_type TEXT NOT NULL,
  date_range_hash TEXT NOT NULL,
  issuer_hash TEXT NOT NULL,
  credential_type_hash TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  document_url TEXT,
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_creds_student ON health_credentials(student_id);

-- ============================================================================
-- LEAVE REQUESTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id),
  credential_id UUID NOT NULL REFERENCES health_credentials(id),
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  reason TEXT NOT NULL,
  zk_proof JSONB NOT NULL,
  ai_risk_score INTEGER NOT NULL DEFAULT 0,
  ai_risk_level TEXT NOT NULL DEFAULT 'low',
  ai_recommendation TEXT NOT NULL DEFAULT 'auto-approve',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs-review')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leave_requests_student ON leave_requests(student_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);

-- ============================================================================
-- PROOF USAGES (duplicate prevention)
-- ============================================================================
CREATE TABLE IF NOT EXISTS proof_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  credential_id UUID NOT NULL REFERENCES health_credentials(id),
  purpose TEXT NOT NULL,
  verifier UUID NOT NULL REFERENCES users(id),
  tx_hash TEXT NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proof_usages_credential ON proof_usages(credential_id);

-- ============================================================================
-- CREDENTIAL NFTs
-- ============================================================================
CREATE TABLE IF NOT EXISTS credential_nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nft_id TEXT UNIQUE NOT NULL,
  asset_id INTEGER,
  recipient_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  achievement TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issuer_logo TEXT,
  issued_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category TEXT NOT NULL DEFAULT 'academic',
  event_name TEXT,
  position TEXT,
  metadata_url TEXT,
  soulbound BOOLEAN NOT NULL DEFAULT TRUE,
  tx_hash TEXT NOT NULL,
  verification_url TEXT NOT NULL,
  shares INTEGER NOT NULL DEFAULT 0,
  verifications INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_credential_nfts_recipient ON credential_nfts(recipient_id);
CREATE INDEX idx_credential_nfts_nft_id ON credential_nfts(nft_id);

-- ============================================================================
-- ELECTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS elections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  eligible_voter_count INTEGER NOT NULL,
  vote_token_asa_id TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CANDIDATES
-- ============================================================================
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id),
  name TEXT NOT NULL,
  manifesto TEXT NOT NULL,
  image_url TEXT,
  position TEXT NOT NULL,
  vote_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_candidates_election ON candidates(election_id);

-- ============================================================================
-- VOTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id),
  voter_hash TEXT NOT NULL,
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  tx_hash TEXT NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(election_id, voter_hash)
);

CREATE INDEX idx_votes_election ON votes(election_id);

-- ============================================================================
-- RPC FUNCTIONS (for atomic increments)
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_shares(credential_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE credential_nfts SET shares = shares + 1 WHERE id = credential_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_verifications(credential_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE credential_nfts SET verifications = verifications + 1 WHERE id = credential_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_vote_count(cand_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE candidates SET vote_count = vote_count + 1 WHERE id = cand_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS, so API routes using service role key work fine.
-- Add policies for anon access if needed for public verification endpoints.

CREATE POLICY "Public credential verification" ON credential_nfts
  FOR SELECT USING (true);

CREATE POLICY "Public election results" ON candidates
  FOR SELECT USING (true);

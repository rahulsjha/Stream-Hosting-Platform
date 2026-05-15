-- 003_waitlist_table.sql

-- Ensure UUID helper is present in case the DB doesn't have it yet
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS waitlist_signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  platform VARCHAR(50),
  channel_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist_signups(created_at DESC);

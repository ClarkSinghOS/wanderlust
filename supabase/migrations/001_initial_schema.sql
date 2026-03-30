-- Wanderlust: Travel Passport App
-- Initial schema: users + trips tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country TEXT,
  city TEXT,
  date_visited DATE,
  stamp_image_url TEXT,
  extracted_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_date_visited ON trips(date_visited DESC);
CREATE INDEX IF NOT EXISTS idx_trips_country ON trips(country);

-- RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users (their own data)
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can read own trips"
  ON trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access users"
  ON users FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access trips"
  ON trips FOR ALL
  USING (auth.role() = 'service_role');

-- Storage bucket for passport stamps
INSERT INTO storage.buckets (id, name, public)
VALUES ('passport-stamps', 'passport-stamps', true)
ON CONFLICT (id) DO NOTHING;

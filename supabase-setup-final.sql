-- Create machines table
CREATE TABLE IF NOT EXISTS machines (
  id UUID PRIMARY KEY,
  userid TEXT NOT NULL,
  name TEXT NOT NULL,
  bankname TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create records table
CREATE TABLE IF NOT EXISTS records (
  id UUID PRIMARY KEY,
  userid TEXT NOT NULL,
  machineid TEXT NOT NULL,
  date TEXT NOT NULL,
  mada NUMERIC(15, 2) NOT NULL DEFAULT 0,
  visa NUMERIC(15, 2) NOT NULL DEFAULT 0,
  mastercard NUMERIC(15, 2) NOT NULL DEFAULT 0,
  gcc NUMERIC(15, 2) NOT NULL DEFAULT 0,
  bankmada NUMERIC(15, 2) DEFAULT 0,
  bankvisa NUMERIC(15, 2) DEFAULT 0,
  bankmastercard NUMERIC(15, 2) DEFAULT 0,
  bankgcc NUMERIC(15, 2) DEFAULT 0,
  extrafields JSONB,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  userid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_machines_userid ON machines(userid);
CREATE INDEX IF NOT EXISTS idx_records_userid ON records(userid);
CREATE INDEX IF NOT EXISTS idx_records_machineid ON records(machineid);
CREATE INDEX IF NOT EXISTS idx_records_date ON records(date);

-- Enable RLS
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Open policies (passcode protects the app)
DROP POLICY IF EXISTS "Allow all" ON machines;
DROP POLICY IF EXISTS "Allow all" ON records;
DROP POLICY IF EXISTS "Allow all" ON businesses;

CREATE POLICY "Allow all" ON machines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON businesses FOR ALL USING (true) WITH CHECK (true);

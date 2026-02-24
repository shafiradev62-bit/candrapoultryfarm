-- Supabase Setup SQL
-- Run this in Supabase SQL Editor

-- Create app_data table for syncing data across devices
CREATE TABLE IF NOT EXISTS app_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default',
  data_type TEXT NOT NULL, -- 'daily_reports', 'warehouse', 'sales', etc.
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_app_data_user_type ON app_data(user_id, data_type);
CREATE INDEX IF NOT EXISTS idx_app_data_updated ON app_data(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for now, you can restrict later)
CREATE POLICY "Allow all operations" ON app_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_app_data_updated_at
  BEFORE UPDATE ON app_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create sync_log table for debugging
CREATE TABLE IF NOT EXISTS sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default',
  action TEXT NOT NULL, -- 'push', 'pull', 'error'
  data_type TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_log_created ON sync_log(created_at DESC);

-- Enable RLS for sync_log
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all sync log operations" ON sync_log
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert initial data structure
INSERT INTO app_data (user_id, data_type, data)
VALUES 
  ('default', 'daily_reports', '[]'::jsonb),
  ('default', 'warehouse', '[]'::jsonb),
  ('default', 'sales', '[]'::jsonb),
  ('default', 'operational', '[]'::jsonb),
  ('default', 'finance', '[]'::jsonb),
  ('default', 'feed_formulas', '[]'::jsonb)
ON CONFLICT DO NOTHING;

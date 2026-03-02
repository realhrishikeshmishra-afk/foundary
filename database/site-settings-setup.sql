-- =====================================================
-- SITE SETTINGS TABLE SETUP
-- =====================================================
-- Run this in your Supabase SQL Editor if you haven't already
-- This is part of the main supabase-setup.sql but can be run separately
-- =====================================================

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS will be enabled separately
-- See FIXED-RLS-POLICIES.sql for all RLS policies

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('site_logo_text', 'Foundarly'),
  ('site_logo_url', NULL),
  ('platform_name', 'Foundarly'),
  ('support_email', 'support@foundarly.com'),
  ('default_session_duration', '60'),
  ('cancellation_window', '24'),
  ('currency', 'USD')
ON CONFLICT (setting_key) DO NOTHING;

-- Create site-assets storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies will be set separately
-- See FIXED-RLS-POLICIES.sql for all storage policies

-- Verify setup
SELECT 'Site settings table created successfully!' as status;
SELECT * FROM site_settings;

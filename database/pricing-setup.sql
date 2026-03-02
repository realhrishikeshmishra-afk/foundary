-- =====================================================
-- PRICING TIERS TABLE
-- Manage pricing plans for consultation services
-- =====================================================

CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER,
  features TEXT[] DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_order ON pricing_tiers(display_order);

-- Insert default pricing tiers
INSERT INTO pricing_tiers (name, description, price, duration_minutes, features, is_popular, display_order) VALUES
('Video Call – 30 Min', 'Quick consultation session', 120.00, 30, ARRAY[
  '1-on-1 private video session',
  'Session recording available',
  'Follow-up summary email',
  'Secure & confidential'
], false, 1),
('Video Call – 60 Min', 'Extended deep-dive session', 220.00, 60, ARRAY[
  'Extended deep-dive session',
  'Session recording available',
  'Detailed action plan',
  'Priority scheduling',
  'Follow-up email support'
], true, 2),
('Chat Consultation', 'Async text-based consultation', 80.00, NULL, ARRAY[
  'Async text-based consultation',
  '48-hour response window',
  'Documented recommendations',
  'Great for quick clarity'
], false, 3)
ON CONFLICT DO NOTHING;

-- RLS will be enabled separately
-- See FIXED-RLS-POLICIES.sql for all RLS policies

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_pricing_tiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pricing_tiers_updated_at
BEFORE UPDATE ON pricing_tiers
FOR EACH ROW
EXECUTE FUNCTION update_pricing_tiers_updated_at();

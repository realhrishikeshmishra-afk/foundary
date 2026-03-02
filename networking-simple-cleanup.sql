-- =====================================================
-- SIMPLE NETWORKING CLEANUP - DROPS ONLY EXISTING TABLES
-- =====================================================
-- This version safely drops only tables that exist
-- Run this, then run networking-complete-setup.sql
-- =====================================================

-- Drop tables only if they exist (CASCADE removes dependencies)
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS message_reactions CASCADE;
DROP TABLE IF EXISTS group_posts CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS channel_messages CASCADE;
DROP TABLE IF EXISTS channel_members CASCADE;
DROP TABLE IF EXISTS startup_showcases CASCADE;
DROP TABLE IF EXISTS user_groups CASCADE;
DROP TABLE IF EXISTS channels CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_channel_member_count() CASCADE;
DROP FUNCTION IF EXISTS update_group_member_count() CASCADE;
DROP FUNCTION IF EXISTS get_networking_stats() CASCADE;
DROP FUNCTION IF EXISTS delete_channel_messages(UUID) CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Cleanup complete! Now run networking-complete-setup.sql';
END $$;

-- =====================================================
-- NETWORKING DATABASE CLEANUP SCRIPT
-- =====================================================
-- Run this FIRST if you have old networking tables
-- This will remove all existing networking data and tables
-- WARNING: This will delete all networking data!
-- =====================================================

-- Disable triggers temporarily
SET session_replication_role = replica;

-- =====================================================
-- 1. DROP EXISTING POLICIES
-- =====================================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on networking tables
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE tablename IN (
            'channels', 'channel_members', 'channel_messages',
            'user_groups', 'group_members', 'group_posts',
            'startup_showcases', 'message_reactions', 'reports'
        )
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- =====================================================
-- 2. DROP EXISTING TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS update_channels_updated_at ON channels;
DROP TRIGGER IF EXISTS update_messages_updated_at ON channel_messages;
DROP TRIGGER IF EXISTS update_groups_updated_at ON user_groups;
DROP TRIGGER IF EXISTS update_showcases_updated_at ON startup_showcases;
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
DROP TRIGGER IF EXISTS update_channel_member_count_trigger ON channel_members;
DROP TRIGGER IF EXISTS update_group_member_count_trigger ON group_members;

-- =====================================================
-- 3. DROP EXISTING FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_channel_member_count() CASCADE;
DROP FUNCTION IF EXISTS update_group_member_count() CASCADE;
DROP FUNCTION IF EXISTS get_networking_stats() CASCADE;
DROP FUNCTION IF EXISTS delete_channel_messages(UUID) CASCADE;

-- =====================================================
-- 4. DROP EXISTING TABLES (in correct order)
-- =====================================================

-- Drop dependent tables first (use CASCADE to handle dependencies)
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS message_reactions CASCADE;
DROP TABLE IF EXISTS group_posts CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS channel_messages CASCADE;
DROP TABLE IF EXISTS channel_members CASCADE;
DROP TABLE IF EXISTS startup_showcases CASCADE;

-- Drop main tables
DROP TABLE IF EXISTS user_groups CASCADE;
DROP TABLE IF EXISTS channels CASCADE;

-- Also drop any views that might reference these tables
DROP VIEW IF EXISTS channel_stats CASCADE;
DROP VIEW IF EXISTS group_stats CASCADE;

-- =====================================================
-- 5. CLEAN UP ORPHANED DATA (if any)
-- =====================================================

-- This section is for safety, in case there are any orphaned records
-- Usually not needed, but good practice

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- =====================================================
-- CLEANUP COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ =====================================================';
  RAISE NOTICE '✅ NETWORKING DATABASE CLEANUP COMPLETE!';
  RAISE NOTICE '✅ =====================================================';
  RAISE NOTICE '';
  RAISE NOTICE '🗑️  Removed:';
  RAISE NOTICE '   ✓ All networking tables';
  RAISE NOTICE '   ✓ All RLS policies';
  RAISE NOTICE '   ✓ All triggers';
  RAISE NOTICE '   ✓ All functions';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  WARNING: All networking data has been deleted!';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next Step:';
  RAISE NOTICE '   Run networking-complete-setup.sql to create fresh tables';
  RAISE NOTICE '';
END $$;

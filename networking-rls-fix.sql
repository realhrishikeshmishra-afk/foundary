-- =====================================================
-- FIX RLS POLICIES FOR GROUP_POSTS
-- =====================================================
-- Run this in Supabase SQL Editor to fix permission errors
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Members can view group posts" ON group_posts;
DROP POLICY IF EXISTS "Members can create group posts" ON group_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON group_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON group_posts;
DROP POLICY IF EXISTS "Admins can delete any post" ON group_posts;

-- Members can view posts in their groups
CREATE POLICY "Members can view group posts"
  ON group_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_posts.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Members can create posts in their groups
CREATE POLICY "Members can create group posts"
  ON group_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_posts.group_id
      AND group_members.user_id = auth.uid()
    )
    AND auth.uid() = user_id
  );

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON group_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON group_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can delete any post
CREATE POLICY "Admins can delete any post"
  ON group_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- VERIFY POLICIES
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Group Posts RLS Policies Fixed!';
  RAISE NOTICE '';
  RAISE NOTICE 'Policies created:';
  RAISE NOTICE '  ✓ Members can view group posts';
  RAISE NOTICE '  ✓ Members can create group posts';
  RAISE NOTICE '  ✓ Users can update own posts';
  RAISE NOTICE '  ✓ Users can delete own posts';
  RAISE NOTICE '  ✓ Admins can delete any post';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Group messaging should now work!';
END $$;

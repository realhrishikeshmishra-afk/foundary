# Storage Setup Fix

## Issue
Getting "StorageUnknownError: Failed to fetch" when trying to save consultants with images.

## Root Cause
The Supabase storage buckets (`consultant-images`, `blog-images`, `site-assets`) haven't been created yet.

## Solution

### Step 1: Create Storage Buckets
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the `storage-buckets-setup.sql` file:

```sql
-- Create storage buckets for the application
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('consultant-images', 'consultant-images', true),
  ('blog-images', 'blog-images', true),
  ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- [Rest of the SQL from storage-buckets-setup.sql]
```

### Step 2: Verify Buckets Created
1. Go to **Storage** in your Supabase dashboard
2. You should see three buckets:
   - `consultant-images`
   - `blog-images` 
   - `site-assets`

### Step 3: Test Upload
1. Try adding a consultant with an image
2. The upload should now work without errors

## Alternative: Manual Bucket Creation
If SQL doesn't work, create buckets manually:

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Create these buckets with **Public** access:
   - `consultant-images`
   - `blog-images`
   - `site-assets`

## Improved Error Handling
The AdminConsultants component now:
- Shows specific storage error messages
- Offers to save consultants without images if upload fails
- Provides better user feedback

## Files Updated
- `storage-buckets-setup.sql` - Complete storage setup
- `src/pages/admin/AdminConsultants.tsx` - Better error handling
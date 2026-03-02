# Networking System - Deployment Guide

## 🎯 Quick Start

### For Fresh Installation (No existing networking tables)

**Simply run this ONE file in Supabase SQL Editor:**

```
networking-complete-setup.sql
```

That's it! Skip the cleanup step.

---

## 📋 Detailed Deployment Steps

### Step 1: Check Your Database

First, check if you have any existing networking tables in Supabase:

1. Go to Supabase Dashboard
2. Navigate to **Table Editor**
3. Look for these tables:
   - `channels`
   - `channel_members`
   - `channel_messages`
   - `user_groups`
   - `startup_showcases`
   - `reports`

### Step 2: Choose Your Path

#### Path A: Fresh Installation (Recommended)
**If you DON'T see any networking tables:**

1. Open Supabase SQL Editor
2. Copy and paste the entire content of `networking-complete-setup.sql`
3. Click "Run"
4. Wait for completion (should take 5-10 seconds)
5. You should see success messages

#### Path B: Clean Reinstall
**If you DO see old networking tables and want to start fresh:**

1. **First**, run `networking-cleanup.sql` to remove old tables
2. **Then**, run `networking-complete-setup.sql` to create fresh tables

---

## ✅ Verify Installation

After running the setup, verify everything is working:

### 1. Check Tables Created

In Supabase Table Editor, you should see:
- ✅ `channels` (16 default channels)
- ✅ `channel_members`
- ✅ `channel_messages`
- ✅ `user_groups`
- ✅ `group_members`
- ✅ `group_posts`
- ✅ `startup_showcases`
- ✅ `message_reactions`
- ✅ `reports`

### 2. Check Default Channels

Open the `channels` table and verify you have 16 channels:
- welcome
- announcements
- startup-founders
- funding-discussions
- tech-ai
- dev-tools
- growth-marketing
- content-strategy
- investment-opportunities
- financial-planning
- job-board
- talent-acquisition
- product-design
- product-management
- freelance-gigs
- startup-showcase

### 3. Check RLS Policies

1. Go to **Authentication** > **Policies**
2. Each table should have multiple policies
3. Look for policies like:
   - "Public channels viewable by all"
   - "Members can view channel messages"
   - "Admins can manage channels"

### 4. Test in Application

1. Navigate to `/network` in your app
2. You should see the channel list in the left sidebar
3. Click on a channel
4. You should see a "Join Channel" button
5. After joining, you should be able to send messages

---

## 🔧 Troubleshooting

### Error: "relation does not exist"

**Cause:** Table hasn't been created yet

**Solution:** Run `networking-complete-setup.sql`

### Error: "policy already exists"

**Cause:** Old policies from previous installation

**Solution:** 
1. Run `networking-cleanup.sql` first
2. Then run `networking-complete-setup.sql`

### Error: "infinite recursion detected in policy"

**Cause:** Circular policy references (shouldn't happen with new setup)

**Solution:**
1. Run `networking-cleanup.sql`
2. Run `networking-complete-setup.sql`

### Can't see channels in app

**Possible causes:**
1. Not logged in
2. RLS policies not applied
3. Tables not created

**Solution:**
1. Make sure you're logged in
2. Check browser console for errors
3. Verify tables exist in Supabase
4. Check RLS policies are enabled

### Can't send messages

**Possible causes:**
1. Haven't joined the channel
2. Not authenticated
3. RLS policy blocking

**Solution:**
1. Click "Join Channel" first
2. Verify you're logged in
3. Check browser console for specific error

---

## 🎨 Admin Panel Access

After deployment, admins can access:

- `/admin/networking/channels` - Manage channels
- `/admin/networking/groups` - Moderate groups
- `/admin/networking/messages` - View/delete messages
- `/admin/networking/showcases` - Approve showcases
- `/admin/networking/reports` - Handle reports

**Note:** Only users with `role = 'admin'` in the `profiles` table can access these pages.

---

## 📊 Database Statistics

To get networking statistics, run this in SQL Editor:

```sql
SELECT * FROM get_networking_stats();
```

Returns:
```json
{
  "total_channels": 16,
  "active_channels": 16,
  "total_groups": 0,
  "active_groups": 0,
  "total_messages": 0,
  "total_showcases": 0,
  "approved_showcases": 0,
  "pending_reports": 0,
  "total_members": 0
}
```

---

## 🔐 Security Features

The setup includes:

✅ **Row Level Security (RLS)** on all tables
✅ **Admin-only policies** for moderation
✅ **User ownership validation** for content
✅ **Channel membership checks** for messages
✅ **Public/Private group support**
✅ **Content approval workflow** for showcases

---

## 🚀 What's Included

### User Features
- Join/leave channels
- Send messages with threading
- Create startup showcases
- Create custom groups
- React to messages
- Report inappropriate content
- Collaboration tags

### Admin Features
- Create/edit/delete channels
- Activate/deactivate channels
- Moderate groups
- Delete any message
- Approve/reject showcases
- Feature showcases
- Handle content reports
- View statistics

---

## 📝 Post-Deployment Checklist

- [ ] Run `networking-complete-setup.sql` in Supabase
- [ ] Verify 9 tables created
- [ ] Verify 16 default channels exist
- [ ] Check RLS policies are enabled
- [ ] Test joining a channel
- [ ] Test sending a message
- [ ] Test creating a showcase
- [ ] Test admin panel access (if admin)
- [ ] Check browser console for errors
- [ ] Verify mobile responsiveness

---

## 🆘 Need Help?

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Check Supabase logs for database errors
3. Verify your user has the correct role in `profiles` table
4. Make sure you're using the latest code from the repository
5. Try clearing browser cache and reloading

---

## 🎉 Success!

If everything is working:
- Users can join channels and chat
- Showcases can be created
- Groups can be formed
- Admins can moderate content
- Reports can be filed and handled

Your networking system is now live! 🚀

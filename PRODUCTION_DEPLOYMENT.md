# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Database Setup
- [ ] Run `production-database-setup.sql` in Supabase SQL Editor
- [ ] Verify all tables are created
- [ ] Verify RLS policies are enabled
- [ ] Create storage buckets (consultant-images, blog-images, site-assets)
- [ ] Test database connections

### 2. Environment Variables
Create `.env.production` file with:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### 3. Authentication Setup
- [ ] Configure Google OAuth in Supabase Dashboard
- [ ] Add production domain to allowed redirect URLs
- [ ] Configure email templates
- [ ] Set up email provider (SMTP)

### 4. Security Configuration
- [ ] Enable RLS on all tables
- [ ] Review and test all RLS policies
- [ ] Configure CORS settings in Supabase
- [ ] Set up rate limiting
- [ ] Enable 2FA for admin accounts

### 5. SEO Optimization
- [ ] Update meta tags in index.html with your domain
- [ ] Create and add og-image.jpg (1200x630px)
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics (optional)
- [ ] Configure robots.txt

### 6. Performance Optimization
- [ ] Run `npm run build` to create production build
- [ ] Test build locally with `npm run preview`
- [ ] Optimize images (compress, use WebP)
- [ ] Enable CDN for static assets
- [ ] Configure caching headers

### 7. Testing
- [ ] Test all user flows (signup, login, booking)
- [ ] Test admin panel functionality
- [ ] Test on mobile devices
- [ ] Test payment flows (if integrated)
- [ ] Test email notifications
- [ ] Run security audit: `npm audit`

## Deployment Steps

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Option 3: Custom Server
```bash
# Build
npm run build

# Upload dist/ folder to your server
# Configure nginx/apache to serve the files
```

## Post-Deployment

### 1. Verify Deployment
- [ ] Test all pages load correctly
- [ ] Test authentication flows
- [ ] Test booking creation
- [ ] Test admin panel access
- [ ] Check console for errors

### 2. Monitoring Setup
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Enable Supabase logs

### 3. Backup Strategy
- [ ] Configure automated database backups
- [ ] Set up storage bucket backups
- [ ] Document recovery procedures

### 4. Create First Admin User
```sql
-- Run in Supabase SQL Editor after first user signs up
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

## Security Best Practices

1. **Never commit .env files** - Use environment variables in deployment platform
2. **Use HTTPS only** - Configure SSL certificates
3. **Regular updates** - Keep dependencies updated
4. **Monitor logs** - Check Supabase logs regularly
5. **Rate limiting** - Implement on API routes
6. **Input validation** - All user inputs are validated (see src/lib/validation.ts)
7. **XSS protection** - Sanitize all user-generated content
8. **CSRF protection** - Enabled by default in Supabase

## Performance Tips

1. **Image optimization** - Use WebP format, compress images
2. **Code splitting** - Already configured with Vite
3. **Lazy loading** - Implement for images and routes
4. **CDN** - Use for static assets
5. **Caching** - Configure browser caching headers
6. **Database indexes** - Already created in SQL setup

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Database Connection Issues
- Verify Supabase URL and anon key
- Check RLS policies
- Verify network connectivity

### Authentication Issues
- Check redirect URLs in Supabase
- Verify OAuth credentials
- Check email provider settings

## Maintenance

### Regular Tasks
- Weekly: Review error logs
- Monthly: Update dependencies
- Quarterly: Security audit
- Yearly: Review and update RLS policies

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Deploy
vercel --prod  # or your deployment method
```

## Support

For issues or questions:
- Check documentation in README.md
- Review Supabase logs
- Check browser console for errors
- Review RLS policies if data access issues

## Rollback Procedure

If deployment fails:
1. Revert to previous deployment in hosting platform
2. Check error logs
3. Fix issues locally
4. Test thoroughly
5. Redeploy

---

**Important**: Always test in a staging environment before deploying to production!

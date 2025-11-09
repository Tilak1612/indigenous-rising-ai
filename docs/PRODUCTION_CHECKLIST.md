# Production Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Quality
- [ ] All TypeScript errors resolved (`npm run build`)
- [ ] All tests passing (`npm test`)
- [ ] No console errors in browser
- [ ] Code reviewed and approved
- [ ] Latest changes merged to main branch

### ✅ Security
- [ ] Environment variables configured in hosting platform
- [ ] Security headers configured (see vercel.json or netlify.toml)
- [ ] RLS policies tested and verified
- [ ] Rate limiting active on all forms
- [ ] Input sanitization applied to all user inputs
- [ ] No sensitive data in client-side code
- [ ] CORS properly configured

### ✅ Performance
- [ ] Build size checked (`npm run build`)
- [ ] Images optimized (WebP format, multiple sizes)
- [ ] Lazy loading implemented for routes
- [ ] Bundle analyzer reviewed
- [ ] Lighthouse score > 90 for all metrics

### ✅ SEO
- [ ] sitemap.xml present and accurate
- [ ] robots.txt configured
- [ ] Meta tags on all pages
- [ ] Structured data implemented
- [ ] Open Graph images created (1200x630px)
- [ ] Canonical URLs set correctly

### ✅ Functionality Testing
- [ ] Newsletter signup works end-to-end
- [ ] Data request form submits successfully
- [ ] Contact form delivers to HubSpot
- [ ] Admin login/logout works
- [ ] Admin dashboard loads and functions
- [ ] Error boundary catches and displays errors
- [ ] Loading states display correctly
- [ ] Form validation shows proper errors
- [ ] Mobile responsive on all pages
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)

### ✅ Backend Configuration
- [ ] Supabase project configured
- [ ] Edge functions deployed
- [ ] Database migrations applied
- [ ] RLS policies active
- [ ] Storage buckets configured (if using)
- [ ] Admin user created and role assigned

### ✅ Compliance
- [ ] Privacy policy up to date
- [ ] Terms of service accurate
- [ ] Cookie consent banner functional
- [ ] Accessibility statement complete
- [ ] AODA compliance verified
- [ ] PIPEDA requirements met

## Deployment Steps

### For Vercel:

1. **Connect Repository**
   ```bash
   # Install Vercel CLI (if not already)
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Set Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_SUPABASE_PROJECT_ID`

3. **Configure Custom Domain**
   - Go to Project Settings > Domains
   - Add your domain (e.g., indigenousrising.ai)
   - Update DNS records as instructed

4. **Verify Deployment**
   - Check deployment URL
   - Test all critical flows
   - Verify environment variables loaded

### For Netlify:

1. **Connect Repository**
   - Go to Netlify Dashboard
   - Click "New site from Git"
   - Select your repository
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Set Environment Variables**
   - Go to Site Settings > Build & Deploy > Environment
   - Add same variables as Vercel

3. **Configure Custom Domain**
   - Go to Domain Management
   - Add custom domain
   - Configure DNS

4. **Verify Deployment**
   - Check deployment URL
   - Test all functionality

## Post-Deployment

### Immediate Checks (Within 1 Hour)
- [ ] Homepage loads correctly
- [ ] All routes accessible
- [ ] Forms submit successfully
- [ ] Admin panel accessible
- [ ] No console errors
- [ ] SSL certificate active
- [ ] Security headers present (check with securityheaders.com)

### First 24 Hours
- [ ] Monitor error logs
- [ ] Check form submissions
- [ ] Verify email deliverability
- [ ] Test mobile experience
- [ ] Monitor performance metrics
- [ ] Check analytics setup

### First Week
- [ ] Review user feedback
- [ ] Check SEO indexing status
- [ ] Monitor database performance
- [ ] Review rate limiting effectiveness
- [ ] Analyze traffic patterns
- [ ] Check for broken links

## Monitoring Setup

### Tools to Configure:
1. **Google Search Console**
   - Submit sitemap
   - Monitor indexing status
   - Check for crawl errors

2. **Google Analytics** (Optional)
   - Set up tracking
   - Configure goals
   - Monitor traffic

3. **Error Tracking** (Recommended)
   - Sentry.io or similar
   - Configure error alerts
   - Set up performance monitoring

4. **Uptime Monitoring**
   - UptimeRobot or similar
   - Configure alerts
   - Monitor API endpoints

## Rollback Plan

If critical issues occur:

1. **Immediate Actions**
   - Note the time and issue
   - Check deployment logs
   - Verify environment variables

2. **Rollback Process**
   ```bash
   # For Vercel
   vercel rollback
   
   # For Netlify
   # Use dashboard to rollback to previous deploy
   ```

3. **Communication**
   - Notify stakeholders
   - Update status page if applicable
   - Document the issue

## Performance Benchmarks

### Target Metrics:
- **Lighthouse Performance**: > 90
- **First Contentful Paint**: < 1.8s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.8s
- **Cumulative Layout Shift**: < 0.1

### Load Times:
- **Homepage**: < 2s
- **Admin Dashboard**: < 3s
- **Form Submissions**: < 1s response

## Security Monitoring

### Regular Checks:
- [ ] Review security headers monthly
- [ ] Audit RLS policies quarterly
- [ ] Update dependencies monthly
- [ ] Review access logs weekly
- [ ] Test rate limiting monthly
- [ ] Verify SSL certificate before expiry

## Maintenance Schedule

### Weekly:
- Monitor error logs
- Check form submissions
- Review performance metrics

### Monthly:
- Update dependencies
- Review security
- Analyze traffic patterns
- Backup database

### Quarterly:
- Full security audit
- Performance optimization review
- User experience assessment
- Compliance verification

## Emergency Contacts

- **Technical Lead**: [Email]
- **DevOps**: [Email]
- **Hosting Support**: support@vercel.com or support@netlify.com
- **Supabase Support**: support@supabase.com

## Success Criteria

✅ **Deployment is successful when:**
1. All pages load without errors
2. Forms submit successfully
3. Admin panel accessible
4. Security headers present
5. SSL certificate active
6. Performance metrics meet targets
7. No critical errors in logs
8. Mobile experience verified
9. Cross-browser compatibility confirmed
10. Stakeholders notified and approved

---

## Quick Reference Commands

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Analyze bundle
npm run build
# Check dist/stats.html

# Deploy to Vercel
vercel --prod

# Check for TypeScript errors
npx tsc --noEmit
```

---

**Last Updated**: 2025-01-15
**Next Review**: 2025-02-15
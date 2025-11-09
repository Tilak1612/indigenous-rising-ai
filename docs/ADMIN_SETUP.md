# Admin Portal Setup Guide

This guide explains how to set up and manage the admin portal for Indigenous Rising AI.

## Quick Start

### 1. Create Your First Admin Account

1. Navigate to `/auth` in your browser
2. Click the "Sign Up" tab
3. Enter your details (name, email, password)
4. Click "Sign Up"

### 2. Grant Admin Access

After creating your account, you need to grant admin privileges. You have two options:

#### Option A: Use the Backend Interface

1. Go to your project settings and click "View Backend"
2. Navigate to the `user_roles` table
3. Click "Insert" and add a new row:
   - `user_id`: Your user ID (find it in the `profiles` table)
   - `role`: `admin`
4. Save the row

#### Option B: Run SQL Directly

If you have access to the SQL editor:

```sql
-- Find your user ID first
SELECT id, email FROM profiles WHERE email = 'your-email@example.com';

-- Grant admin role (replace the UUID with your actual user ID)
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR-USER-ID-HERE', 'admin');
```

### 3. Access the Admin Portal

1. Navigate to `/admin` in your browser
2. You should now see the admin dashboard!

## Admin Features

### Newsletter Management

- **View all subscribers**: See complete list with status
- **Export to CSV**: Download subscriber data for analysis
- **Bulk unsubscribe**: Manage subscriptions in bulk
- **Statistics dashboard**: Track subscriber growth

### Data Requests Management

- **View all PIPEDA requests**: Monitor compliance requests
- **Assign to team members**: Distribute workload
- **Update status**: Track request progress (pending, in progress, completed)
- **Request details**: View full information about each request

### Content Management

- **Homepage sections**: Update hero text and descriptions
- **Statistics**: Modify the numbers displayed on the homepage
- **Testimonials**: Manage customer testimonials
- **FAQs**: Update frequently asked questions

## Managing Team Members

To add team members with limited access:

```sql
-- Add a team member role (can view and manage data requests)
INSERT INTO user_roles (user_id, role)
VALUES ('TEAM-MEMBER-USER-ID', 'team_member');
```

Team members can:
- View and manage data requests
- Be assigned to data requests
- Cannot access newsletter or content management

## Security Best Practices

1. **Use strong passwords**: Minimum 8 characters with mix of letters, numbers, and symbols
2. **Limit admin access**: Only grant admin role to trusted users
3. **Regular audits**: Periodically review who has admin access
4. **Separate roles**: Use team_member role for staff who don't need full access

## Role Hierarchy

- **admin**: Full access to all management features
- **team_member**: Can manage data requests only
- **user**: Regular user (no admin access)

## Troubleshooting

### Cannot access /admin

- Verify you've been granted the admin role in the `user_roles` table
- Try signing out and signing in again
- Check browser console for errors

### Changes not saving

- Ensure you're logged in
- Check your internet connection
- Verify your admin role hasn't been revoked

### Forgot password

Currently password reset is not implemented. Contact your database administrator to reset via SQL:

```sql
-- Update email to trigger password reset email
-- (Requires email confirmation to be enabled)
```

## API Integration

The admin portal uses secure backend APIs with Row-Level Security (RLS):

- All queries respect user roles
- Admin actions are logged
- Data is encrypted in transit and at rest

## Support

For technical support or questions:
- Check the project documentation
- Contact your development team
- Review backend logs for errors

## Future Enhancements

Planned features:
- Email notifications for new requests
- Advanced filtering and search
- Custom reports and analytics
- Audit log viewer
- Multi-language support
# CognexiaAI Database Setup Guide

This guide will help you set up the Supabase database for Contact Form and Job Application submissions.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A Supabase project created

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Project Name**: CognexiaAI-ERP (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
4. Click "Create new project"
5. Wait for the project to be created (takes 1-2 minutes)

## Step 2: Run Database Schema

1. In your Supabase project dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `schema.sql` file
4. Paste it into the SQL Editor
5. Click "Run" or press `Ctrl+Enter`
6. Verify that the tables were created:
   - Go to **Table Editor** (left sidebar)
   - You should see `contact_inquiries` and `job_applications` tables

## Step 3: Create Storage Bucket for File Uploads

1. In your Supabase project, go to **Storage** (left sidebar)
2. Click "New Bucket"
3. Bucket details:
   - **Name**: `job-applications`
   - **Public bucket**: Yes (check the box)
4. Click "Create bucket"

### Set Storage Policies

After creating the bucket:

1. Click on the `job-applications` bucket
2. Go to "Policies" tab
3. Click "New Policy"
4. Create an **INSERT** policy:
   - **Policy name**: Allow public uploads
   - **Policy definition**: `true`
   - **Target roles**: `public`
   - Click "Review" then "Save policy"

5. Create a **SELECT** policy:
   - **Policy name**: Allow public read
   - **Policy definition**: `true`
   - **Target roles**: `public`
   - Click "Review" then "Save policy"

## Step 4: Get Your API Keys

1. In your Supabase project, go to **Settings** (gear icon in left sidebar)
2. Go to **API** section
3. You'll see:
   - **Project URL**: e.g., `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`
   - **service_role key**: Another long string (keep this secret!)

## Step 5: Configure Environment Variables

1. In your project root (`auth-portal`), create or update `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

2. Replace the values with your actual Supabase credentials

### Important Notes:
- **NEVER** commit `.env.local` to version control
- The `NEXT_PUBLIC_` prefix makes the variable accessible in the browser
- The `SUPABASE_SERVICE_ROLE_KEY` should only be used in server-side code (API routes)

## Step 6: Install Dependencies

If not already installed, add the Supabase client:

```bash
npm install @supabase/supabase-js
```

## Database Schema Overview

### contact_inquiries Table

Stores all contact form submissions:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Contact person's name |
| email | VARCHAR(255) | Contact email |
| phone | VARCHAR(50) | Contact phone (optional) |
| company | VARCHAR(255) | Company name (optional) |
| inquiry_type | VARCHAR(50) | Type: general, sales, support, partnership, demo |
| subject | VARCHAR(500) | Inquiry subject |
| message | TEXT | Inquiry message |
| status | VARCHAR(50) | Status: pending, in_progress, resolved, closed |
| assigned_to | VARCHAR(255) | Assigned team member |
| notes | TEXT | Internal notes |
| created_at | TIMESTAMPTZ | Submission timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |
| responded_at | TIMESTAMPTZ | Response timestamp |

### job_applications Table

Stores all job application submissions:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| first_name | VARCHAR(255) | Applicant's first name |
| last_name | VARCHAR(255) | Applicant's last name |
| email | VARCHAR(255) | Applicant email |
| phone | VARCHAR(50) | Applicant phone |
| position | VARCHAR(255) | Position applied for |
| department | VARCHAR(100) | Department |
| experience_years | VARCHAR(50) | Years of experience |
| expected_salary | VARCHAR(100) | Expected salary |
| education | VARCHAR(100) | Highest education |
| university | VARCHAR(255) | University name |
| skills | TEXT | Technical skills |
| cover_letter | TEXT | Cover letter |
| resume_url | TEXT | Resume file URL in storage |
| portfolio_url | TEXT | Portfolio file URL in storage |
| status | VARCHAR(50) | Status: pending, reviewing, shortlisted, rejected, hired |
| stage | VARCHAR(50) | Hiring stage |
| created_at | TIMESTAMPTZ | Application timestamp |

## Testing the Setup

### Test Contact Form:

1. Start your dev server: `npm run dev`
2. Navigate to `http://localhost:3000/contact`
3. Fill out and submit the contact form
4. Check Supabase:
   - Go to **Table Editor**
   - Open `contact_inquiries` table
   - Verify your submission appears

### Test Job Application:

1. Navigate to `http://localhost:3000/careers/apply`
2. Fill out and submit the application form
3. Upload a resume file
4. Check Supabase:
   - Go to **Table Editor**
   - Open `job_applications` table
   - Verify your application appears
   - Go to **Storage** → `job-applications` bucket
   - Verify the resume file was uploaded to `resumes/` folder

## Viewing Submissions

### Via Supabase Dashboard:

1. Go to **Table Editor**
2. Click on `contact_inquiries` or `job_applications`
3. View, filter, and search submissions

### Query Examples:

```sql
-- Get all pending contact inquiries
SELECT * FROM contact_inquiries 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- Get all job applications for a specific position
SELECT * FROM job_applications 
WHERE position = 'Senior AI Engineer' 
ORDER BY created_at DESC;

-- Get applications by email
SELECT * FROM job_applications 
WHERE email = 'candidate@example.com';
```

## Security & Privacy

1. **Row Level Security (RLS)** is enabled on both tables
2. Public can INSERT (submit forms)
3. Only authenticated users can SELECT/UPDATE (view/manage submissions)
4. Sensitive data should be handled according to GDPR/privacy regulations
5. File uploads are stored securely in Supabase Storage

## Troubleshooting

### Issue: "Failed to submit form"

**Solution**:
- Verify environment variables are set correctly in `.env.local`
- Check Supabase project is running (not paused)
- Check browser console for detailed error messages

### Issue: "File upload failed"

**Solution**:
- Verify storage bucket `job-applications` exists
- Verify storage policies allow public INSERT
- Check file size limits (default 50MB)
- Check file extension is allowed (.pdf, .doc, .docx)

### Issue: "Database connection error"

**Solution**:
- Verify SUPABASE_URL and API keys are correct
- Check Supabase project status in dashboard
- Restart your dev server after updating .env.local

## Next Steps

### Optional Enhancements:

1. **Email Notifications**:
   - Set up email service (SendGrid, Mailgun, Resend)
   - Send confirmation emails to applicants
   - Send notification emails to HR team

2. **Admin Dashboard**:
   - Create admin routes to view submissions
   - Add filtering, sorting, and search functionality
   - Implement status update workflows

3. **File Validation**:
   - Add client-side file size validation
   - Implement virus scanning for uploads
   - Add file type restrictions

4. **Analytics**:
   - Track form conversion rates
   - Monitor application sources
   - Generate reports using the provided views

## Support

If you encounter issues:
1. Check Supabase documentation: https://supabase.com/docs
2. Check Next.js API routes documentation
3. Review browser console and server logs
4. Contact: support@cognexiaai.com

---

**Last Updated**: January 2026  
**Version**: 1.0

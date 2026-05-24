# GitHub Pages Deployment Guide

## ✅ Build Successful!

Your app has been successfully built and is ready to deploy to GitHub Pages.

## 📋 Steps to Deploy:

### 1. Push the Workflow File Manually

Since the automatic push failed due to token permissions, you need to:

1. Go to your GitHub repository: https://github.com/semakapos/atm
2. Click on "Add file" → "Create new file"
3. Name it: `.github/workflows/deploy.yml`
4. Copy and paste the content from your local `.github/workflows/deploy.yml` file
5. Commit the file

### 2. Add GitHub Secrets

Go to your repository Settings → Secrets and variables → Actions → New repository secret

Add these two secrets:
- **Name:** `VITE_SUPABASE_URL`
  **Value:** `https://odqgvinezahwenrwyoww.supabase.co`

- **Name:** `VITE_SUPABASE_ANON_KEY`
  **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcWd2aW5lemFod2Vucnd5b3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTc3NTMsImV4cCI6MjA5NTEzMzc1M30.PDb2P7_9j3c6lQjmpKtNSOu3Knk5i4IVY6zxgx9d3e8`

### 3. Enable GitHub Pages

1. Go to Settings → Pages
2. Under "Build and deployment":
   - Source: **GitHub Actions**
3. Save

### 4. Trigger Deployment

Once you commit the workflow file, it will automatically:
- Build your app
- Deploy to GitHub Pages

Your site will be available at: **https://semakapos.github.io/atm/**

### 5. Configure Supabase CORS

In your Supabase dashboard:
1. Go to Settings → API
2. Add your GitHub Pages URL to allowed origins:
   - `https://semakapos.github.io`

## 🔒 Security Checklist

✅ No API keys in client code
✅ Supabase ANON key is safe to expose (designed for client-side)
✅ Environment variables stored as GitHub Secrets
✅ RLS enabled on Supabase tables
✅ Authentication required for all operations

## 🚀 Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
npm run build
```

Then upload the `dist` folder contents to any static hosting service.

## 📝 Notes

- The app is configured with base path `/atm/`
- All routes will work correctly with GitHub Pages
- The build is optimized and production-ready
- Google Font "Inter" is loaded from CDN

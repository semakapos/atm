# GitHub Secrets Setup Guide

## Problem
Your deployed site at https://munfilih.github.io/atm/ shows a blank screen with this error:
```
Uncaught Error: supabaseUrl is required.
```

## Solution
You need to add Supabase credentials as GitHub Secrets so they're available during the build process.

## Steps to Fix

### 1. Navigate to GitHub Secrets Page
Go to: https://github.com/Munfilih/ATM/settings/secrets/actions

### 2. Add First Secret - VITE_SUPABASE_URL
1. Click **"New repository secret"** button (green button on the right)
2. In the **Name** field, enter exactly: `VITE_SUPABASE_URL`
3. In the **Secret** field, paste: `https://bczwbgfrfcmqqpoohbyc.supabase.co`
4. Click **"Add secret"**

### 3. Add Second Secret - VITE_SUPABASE_ANON_KEY
1. Click **"New repository secret"** button again
2. In the **Name** field, enter exactly: `VITE_SUPABASE_ANON_KEY`
3. In the **Secret** field, paste:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjendiZ2ZyZmNtcXFwb29oYnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMjc4OTQsImV4cCI6MjA4MDcwMzg5NH0.lcLEkikxVPyHC58E_6As40z0778fY3_pfKzl1t9vQtM
```
4. Click **"Add secret"**

### 4. Verify Secrets Were Added
After adding both secrets, you should see them listed on the secrets page:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

### 5. Trigger a New Deployment
The workflow should automatically run since we pushed a commit. If not:
1. Go to https://github.com/Munfilih/ATM/actions
2. Click on the latest "Deploy to GitHub Pages" workflow
3. Click "Re-run all jobs" if needed

### 6. Wait for Deployment
- Wait 2-3 minutes for the workflow to complete
- Check https://github.com/Munfilih/ATM/actions to see if it's successful (green checkmark)

### 7. Test Your Site
- Clear your browser cache (Ctrl+Shift+Delete)
- Visit https://munfilih.github.io/atm/
- The login screen should now appear!

## Why This Is Needed
The app uses Supabase for authentication and data storage. During the build process, Vite needs these environment variables to embed them into the compiled JavaScript. Without them, the app can't connect to Supabase and fails to load.

## Troubleshooting
If the site still shows a blank screen after adding secrets:
1. Check that the workflow completed successfully (green checkmark)
2. Hard refresh your browser (Ctrl+Shift+F5)
3. Try opening in an incognito/private window
4. Check the browser console for any new errors

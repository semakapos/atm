# Supabase Setup Guide

## Migration from Firebase to Supabase

This app has been migrated from Firebase to Supabase for more accurate financial calculations using PostgreSQL's NUMERIC type.

## Setup Steps

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details and wait for setup to complete

### 2. Run Database Schema
1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL to create tables, indexes, and security policies

### 3. Configure Environment Variables
1. In Supabase dashboard, go to Settings > API
2. Copy your Project URL and anon/public key
3. Update `.env.local` with your credentials:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

### 4. Install Dependencies
```bash
npm install
```

### 5. Run the Application
```bash
npm run dev
```

## Key Benefits of Supabase

1. **Accurate Calculations**: PostgreSQL NUMERIC(15,2) type ensures precise decimal calculations
2. **Real-time Subscriptions**: Built-in real-time capabilities
3. **Row Level Security**: Automatic data isolation per user
4. **Better Performance**: Optimized queries with proper indexing
5. **Type Safety**: Strong typing with PostgreSQL

## Database Structure

### Tables
- **machines**: Store card machine information
- **records**: Store daily reconciliation records with accurate decimal values
- **businesses**: Store business information

### Security
All tables have Row Level Security (RLS) enabled, ensuring users can only access their own data.

## Authentication

Supabase provides built-in authentication with:
- Email/Password authentication
- Session management
- Secure token handling

## Notes

- All monetary values use NUMERIC(15,2) for precision
- Offline support maintained through local storage
- Automatic sync when online

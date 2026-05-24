<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ReconcilePro - Card Machine Reconciliation App

A professional reconciliation application with accurate financial calculations powered by Supabase.

## Prerequisites

- Node.js (v16 or higher)
- Supabase account

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Supabase:**
   - Create a Supabase project at [https://supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
   - See [SUPABASE-SETUP.md](SUPABASE-SETUP.md) for detailed instructions

3. **Set environment variables in `.env.local`:**
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

## Migration from Firebase

This app has been migrated from Firebase to Supabase for:
- **Accurate decimal calculations** using PostgreSQL NUMERIC types
- Better performance with optimized queries
- Built-in Row Level Security
- Real-time capabilities

-- Grant full permissions to anon and authenticated roles
GRANT ALL ON public.machines TO anon, authenticated;
GRANT ALL ON public.records TO anon, authenticated;
GRANT ALL ON public.businesses TO anon, authenticated;
GRANT ALL ON public.accounts TO anon, authenticated;

-- Grant usage on sequences if they exist
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Disable RLS on all tables (since using custom auth)
ALTER TABLE machines DISABLE ROW LEVEL SECURITY;
ALTER TABLE records DISABLE ROW LEVEL SECURITY;
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own machines" ON machines;
DROP POLICY IF EXISTS "Users can insert their own machines" ON machines;
DROP POLICY IF EXISTS "Users can update their own machines" ON machines;
DROP POLICY IF EXISTS "Users can delete their own machines" ON machines;
DROP POLICY IF EXISTS "Users can view their own records" ON records;
DROP POLICY IF EXISTS "Users can insert their own records" ON records;
DROP POLICY IF EXISTS "Users can update their own records" ON records;
DROP POLICY IF EXISTS "Users can delete their own records" ON records;
DROP POLICY IF EXISTS "Users can view their own business" ON businesses;
DROP POLICY IF EXISTS "Users can insert their own business" ON businesses;
DROP POLICY IF EXISTS "Users can update their own business" ON businesses;
DROP POLICY IF EXISTS "Users can delete their own business" ON businesses;

-- Verify permissions
SELECT 
    tablename, 
    has_table_privilege('anon', schemaname||'.'||tablename, 'SELECT') as can_select,
    has_table_privilege('anon', schemaname||'.'||tablename, 'INSERT') as can_insert,
    has_table_privilege('anon', schemaname||'.'||tablename, 'UPDATE') as can_update,
    has_table_privilege('anon', schemaname||'.'||tablename, 'DELETE') as can_delete
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('machines', 'records', 'businesses', 'accounts');

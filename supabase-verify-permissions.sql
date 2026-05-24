-- Verify current permissions
SELECT 
    tablename,
    has_table_privilege('anon', schemaname||'.'||tablename, 'SELECT') as can_select,
    has_table_privilege('anon', schemaname||'.'||tablename, 'INSERT') as can_insert,
    has_table_privilege('anon', schemaname||'.'||tablename, 'UPDATE') as can_update,
    has_table_privilege('anon', schemaname||'.'||tablename, 'DELETE') as can_delete
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('machines', 'records', 'businesses', 'accounts');

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('machines', 'records', 'businesses', 'accounts');

-- If permissions are missing, run this:
-- GRANT ALL ON public.machines TO anon, authenticated;
-- GRANT ALL ON public.records TO anon, authenticated;
-- GRANT ALL ON public.businesses TO anon, authenticated;
-- GRANT ALL ON public.accounts TO anon, authenticated;
-- ALTER TABLE machines DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE records DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;

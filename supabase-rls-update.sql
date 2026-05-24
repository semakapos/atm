-- Drop old auth-based policies
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

-- Allow full access via anon key (passcode protects the app)
CREATE POLICY "Allow all" ON machines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON businesses FOR ALL USING (true) WITH CHECK (true);

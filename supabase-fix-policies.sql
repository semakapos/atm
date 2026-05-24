-- Drop old policies if they exist
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

-- Create new policies with correct column names
CREATE POLICY "Users can view their own machines" ON machines
  FOR SELECT USING (auth.uid()::text = userid);
CREATE POLICY "Users can insert their own machines" ON machines
  FOR INSERT WITH CHECK (auth.uid()::text = userid);
CREATE POLICY "Users can update their own machines" ON machines
  FOR UPDATE USING (auth.uid()::text = userid);
CREATE POLICY "Users can delete their own machines" ON machines
  FOR DELETE USING (auth.uid()::text = userid);

CREATE POLICY "Users can view their own records" ON records
  FOR SELECT USING (auth.uid()::text = userid);
CREATE POLICY "Users can insert their own records" ON records
  FOR INSERT WITH CHECK (auth.uid()::text = userid);
CREATE POLICY "Users can update their own records" ON records
  FOR UPDATE USING (auth.uid()::text = userid);
CREATE POLICY "Users can delete their own records" ON records
  FOR DELETE USING (auth.uid()::text = userid);

CREATE POLICY "Users can view their own business" ON businesses
  FOR SELECT USING (auth.uid()::text = userid);
CREATE POLICY "Users can insert their own business" ON businesses
  FOR INSERT WITH CHECK (auth.uid()::text = userid);
CREATE POLICY "Users can update their own business" ON businesses
  FOR UPDATE USING (auth.uid()::text = userid);
CREATE POLICY "Users can delete their own business" ON businesses
  FOR DELETE USING (auth.uid()::text = userid);

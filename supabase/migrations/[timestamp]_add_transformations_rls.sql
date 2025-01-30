-- Enable RLS
ALTER TABLE transformations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own transformations"
ON transformations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own transformations"
ON transformations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own transformations"
ON transformations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transformations"
ON transformations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 
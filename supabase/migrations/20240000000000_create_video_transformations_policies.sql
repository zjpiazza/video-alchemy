-- Create policies for video_transformations table
ALTER TABLE video_transformations ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own transformations
CREATE POLICY "Users can insert their own transformations"
ON video_transformations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own transformations
CREATE POLICY "Users can view their own transformations"
ON video_transformations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own transformations
CREATE POLICY "Users can update their own transformations"
ON video_transformations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id); 
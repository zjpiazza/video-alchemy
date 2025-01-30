-- First, enable RLS on the storage.objects table if not already enabled
alter table storage.objects enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Allow authenticated uploads" on storage.objects;
drop policy if exists "Allow users to read own uploads" on storage.objects;
drop policy if exists "Allow users to delete own uploads" on storage.objects;
drop policy if exists "Allow service role to upload processed videos" on storage.objects;
drop policy if exists "Allow service role to read videos" on storage.objects;
drop policy if exists "Allow public read" on storage.objects;
drop policy if exists "Allow public downloads" on storage.objects;

-- Create a bucket for videos if it doesn't exist
insert into storage.buckets (id, name, public)
select 'videos', 'videos', false  -- Set to false to make bucket private by default
where not exists (
    select 1 from storage.buckets where id = 'videos'
);

-- Allow authenticated users to upload videos to their own space
create policy "Allow authenticated uploads"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'videos' 
    and auth.uid() = owner
    and (storage.foldername(name))[1] = auth.uid()::text  -- Force files into user-specific folders
);

-- Allow users to read only their own uploads
create policy "Allow users to read own uploads"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'videos'
    and (
        auth.uid() = owner
        or (storage.foldername(name))[1] = auth.uid()::text
    )
);

-- Allow users to delete only their own uploads
create policy "Allow users to delete own uploads"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'videos'
    and auth.uid() = owner
    and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow the edge function (service role) to upload processed videos
create policy "Allow service role to upload processed videos"
on storage.objects 
for insert
to service_role
with check (
    bucket_id = 'videos'
    and (storage.foldername(name))[1] = 'processed'
    and (storage.foldername(name))[2] = auth.uid()::text  -- Store processed files in user-specific folders
);

-- Allow the edge function to read any video (needed for processing)
create policy "Allow service role to read videos"
on storage.objects
for select
to service_role
using (bucket_id = 'videos');

-- Allow public read access if needed
create policy "Allow public read"
on storage.objects
for select
to public
using (bucket_id = 'videos');

-- Allow public downloads if you want the videos to be publicly accessible
create policy "Allow public downloads"
on storage.objects for select
to public
using (bucket_id = 'videos');

-- Or if you want only authenticated users to download
-- create policy "Allow authenticated downloads"
-- on storage.objects for select
-- to authenticated
-- using (bucket_id = 'videos');

-- Allow authenticated users to read their processed videos
create policy "Allow users to read processed videos"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'videos'
    and (storage.foldername(name))[1] = 'processed'
    and (storage.foldername(name))[2] = auth.uid()::text
); 
-- Function to increment user quota
create or replace function increment_user_quota(size_to_add bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update user_quotas
  set total_size_bytes = total_size_bytes + size_to_add
  where user_id = auth.uid();
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function increment_user_quota(bigint) to authenticated;

-- Add RLS policy for updates
create policy "Users can update their own quota"
    on user_quotas for update
    using (auth.uid() = user_id); 
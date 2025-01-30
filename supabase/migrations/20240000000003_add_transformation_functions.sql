-- Function to complete transformation and update quota atomically
create or replace function complete_transformation(
  p_transformation_id uuid,
  p_output_path text,
  p_size bigint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  -- Get the user_id from the transformation
  select user_id into v_user_id
  from transformations
  where id = p_transformation_id;

  -- Update the transformation
  update transformations
  set 
    status = 'completed',
    video_output_path = p_output_path,
    processed_size = p_size,
    completed_at = now()
  where id = p_transformation_id;

  -- Update the user's quota
  update user_quotas
  set total_size_bytes = total_size_bytes + p_size
  where user_id = v_user_id;
end;
$$;

-- Grant execute permission to service role only
grant execute on function complete_transformation(uuid, text, bigint) to service_role; 
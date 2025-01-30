create table if not exists public.user_quotas (
    user_id uuid primary key references auth.users(id) on delete cascade,
    total_size_bytes bigint not null default 0,
    max_size_bytes bigint not null default 10737418240, -- 10GB in bytes
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a trigger to update the updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_user_quotas_updated_at
    before update on user_quotas
    for each row
    execute function update_updated_at_column();

-- Add RLS policies
alter table public.user_quotas enable row level security;

create policy "Users can view their own quota"
    on public.user_quotas for select
    using (auth.uid() = user_id);

-- Trigger to create quota entry when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.user_quotas (user_id)
    values (new.id);
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user(); 
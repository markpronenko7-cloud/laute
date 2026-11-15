create table if not exists public.laute_consultant_quota (
  bucket text primary key check (bucket = 'global' or bucket ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  requests integer not null check (requests >= 0)
);

alter table public.laute_consultant_quota enable row level security;
revoke all on public.laute_consultant_quota from public, anon, authenticated;
grant select, insert, update, delete on public.laute_consultant_quota to service_role;

create or replace function public.laute_consultant_reserve(p_client text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_time_utc timestamptz := now();
  day_end timestamptz := (date_trunc('day', now() at time zone 'UTC') + interval '1 day') at time zone 'UTC';
  saved_expiry timestamptz;
  saved_count integer;
  client_count integer;
begin
  if p_client is not null and p_client !~ '^[0-9a-f]{64}$' then
    return false;
  end if;

  -- All accepted calls reserve one unit of the same UTC-day budget.
  insert into public.laute_consultant_quota (bucket, expires_at, requests)
    values ('global', day_end, 0) on conflict (bucket) do nothing;
  select expires_at, requests into saved_expiry, saved_count
    from public.laute_consultant_quota where bucket = 'global' for update;
  if saved_expiry > current_time_utc and saved_count >= 250 then
    return false;
  end if;

  if p_client is not null then
    insert into public.laute_consultant_quota as quota (bucket, expires_at, requests)
      values (p_client, current_time_utc + interval '10 minutes', 1)
      on conflict (bucket) do update set
        requests = case when quota.expires_at <= current_time_utc then 1 else quota.requests + 1 end,
        expires_at = case when quota.expires_at <= current_time_utc then excluded.expires_at else quota.expires_at end
      where quota.expires_at <= current_time_utc or quota.requests < 12
      returning requests into client_count;
    if client_count is null then return false; end if;
  end if;

  update public.laute_consultant_quota set
    requests = case when saved_expiry <= current_time_utc then 1 else saved_count + 1 end,
    expires_at = day_end
    where bucket = 'global';
  delete from public.laute_consultant_quota where bucket <> 'global' and expires_at <= current_time_utc;
  return true;
end;
$$;

revoke all on function public.laute_consultant_reserve(text) from public, anon, authenticated;
grant execute on function public.laute_consultant_reserve(text) to service_role;

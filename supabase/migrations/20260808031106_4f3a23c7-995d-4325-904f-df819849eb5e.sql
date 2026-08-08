create type public.app_role as enum ('admin', 'therapist', 'supervisor');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  license text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "Users can manage own profile"
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users can read own roles"
  on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create policy "Admins can manage all profiles"
  on public.profiles
  for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
  on public.user_roles
  for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_default_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'therapist');
  return new;
end;
$$;

create trigger on_auth_user_default_role
  after insert on auth.users
  for each row execute function public.handle_default_role();

create table public.children (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  birth_date date,
  target_behavior text,
  notes text,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.children to authenticated;
grant all on public.children to service_role;

alter table public.children enable row level security;

create policy "Owner can manage own children"
  on public.children
  for all
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Admins can manage all children"
  on public.children
  for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create table public.abc_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  child_id uuid references public.children(id) on delete set null,
  timestamp timestamptz not null default now(),
  phase text check (phase in ('baseline','intervention')),
  antecedent text not null default '',
  antecedent_tags text[] not null default '{}',
  behavior text not null,
  severity integer not null default 1 check (severity between 1 and 5),
  consequence text not null default '',
  consequence_tags text[] not null default '{}',
  environment_tags text[] not null default '{}',
  environment_notes text,
  hypothesized_function text,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.abc_logs to authenticated;
grant all on public.abc_logs to service_role;

alter table public.abc_logs enable row level security;

create policy "Owner can manage own logs"
  on public.abc_logs
  for all
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Admins can manage all logs"
  on public.abc_logs
  for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create table public.fa_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  child_id uuid references public.children(id) on delete set null,
  condition text not null check (condition in ('Attention','Demand','Tangible','Play')),
  duration_min integer not null check (duration_min > 0),
  frequency integer not null default 0 check (frequency >= 0),
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.fa_sessions to authenticated;
grant all on public.fa_sessions to service_role;

alter table public.fa_sessions enable row level security;

create policy "Owner can manage own sessions"
  on public.fa_sessions
  for all
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Admins can manage all sessions"
  on public.fa_sessions
  for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
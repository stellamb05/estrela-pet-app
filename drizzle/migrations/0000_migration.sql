create type public.app_role as enum ('admin', 'cliente');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '' check (phone = '' or phone ~ '^[0-9]{11}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Own profile read" on public.profiles for select to authenticated using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));
create policy "Own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Own roles read" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare _phone text := regexp_replace(coalesce(new.raw_user_meta_data->>'phone',''), '\D', '', 'g');
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), case when _phone ~ '^[0-9]{11}$' then _phone else '' end);
  insert into public.user_roles (user_id, role) values (new.id, 'cliente');
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();
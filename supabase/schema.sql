-- Activate RLS
alter table profiles enable row level security;
alter table services enable row level security;
alter table bookings enable row level security;

-- GetRole Function
create function public.get_my_role()
returns user_role
language sql
stable
security definer set search_path = ''
as $$
  select role from public.profiles where id = auth.uid()
$$;


-- 1. Role
create type user_role as enum ('user', 'professional', 'admin');

-- 2. Profile
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'user',
  name text,
  created_at timestamptz not null default now()
);

-- 3. Service
create table services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  professional_id uuid not null references profiles(id) on delete cascade,
  active boolean not null default true
);

-- 4. Booking
create table bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  date timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

-- 5. Register Function
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();



-- Users can read their own profile
create policy "profiles: users read own"
on profiles for select
to authenticated
using (id = (select auth.uid()));

-- Users can update their own profile, but cannot change their role
create policy "profiles: users update own (no role change)"
on profiles for update
to authenticated
using (id = (select auth.uid()))
with check (
  id = (select auth.uid())
  and role = (select public.get_my_role())
);

-- Admins have full access to all profiles
create policy "profiles: admins full access"
on profiles for all
to authenticated
using ((select public.get_my_role()) = 'admin')
with check ((select public.get_my_role()) = 'admin');




-- Anyone (even anonymous visitors) can read active services
create policy "services: public read active"
on services for select
to anon, authenticated
using (active = true);

-- Professionals can read all their own services, including inactive ones
create policy "services: professionals read own"
on services for select
to authenticated
using (professional_id = (select auth.uid()));

-- Only professionals can create services, and only for themselves
create policy "services: professionals insert own"
on services for insert
to authenticated
with check (
  professional_id = (select auth.uid())
  and (select public.get_my_role()) = 'professional'
);

-- Professionals can update their own services (and cannot reassign them)
create policy "services: professionals update own"
on services for update
to authenticated
using (professional_id = (select auth.uid()) and (select public.get_my_role()) = 'professional')
with check (professional_id = (select auth.uid()) and (select public.get_my_role()) = 'professional');

-- Professionals can delete their own services
create policy "services: professionals delete own"
on services for delete
to authenticated
using (professional_id = (select auth.uid()) and (select public.get_my_role()) = 'professional');

-- Admins have full access to all services
create policy "services: admins full access"
on services for all
to authenticated
using ((select public.get_my_role()) = 'admin')
with check ((select public.get_my_role()) = 'admin');



-- Users can read their own bookings
create policy "bookings: users read own"
on bookings for select
to authenticated
using (user_id = (select auth.uid()));

-- Professionals can read bookings for their own services
create policy "bookings: professionals read bookings of own services"
on bookings for select
to authenticated
using (
  exists (
    select 1 from services s
    where s.id = bookings.service_id
      and s.professional_id = (select auth.uid())
  )
);

-- Users can create bookings for themselves, only on active services
create policy "bookings: users insert own"
on bookings for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (select public.get_my_role()) = 'user'
  and exists (
    select 1 from services s
    where s.id = service_id and s.active = true
  )
);

-- Users can update their own bookings (e.g. cancel or change date)
create policy "bookings: users update own"
on bookings for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()))  ;

-- Professionals can manage bookings for their own services (e.g. confirm)
create policy "bookings: professionals update bookings of own services"
on bookings for update
to authenticated
using (
  exists (
    select 1 from services s
    where s.id = bookings.service_id
      and s.professional_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from services s
    where s.id = bookings.service_id
      and s.professional_id = (select auth.uid())
  )
);

-- Users can delete their own bookings
create policy "bookings: users delete own"
on bookings for delete
to authenticated
using (user_id = (select auth.uid()));

-- Admins have full access to all bookings
create policy "bookings: admins full access"
on bookings for all
to authenticated
using ((select public.get_my_role()) = 'admin')
with check ((select public.get_my_role()) = 'admin');


revoke update on bookings from anon, authenticated;
grant update (date, status) on bookings to authenticated;

create function public.check_booking_status_change()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.status is distinct from old.status
     and public.get_my_role() = 'user'
     and new.status <> 'cancelled' then
    raise exception 'Users can only cancel their bookings';
  end if;
  return new;
end;
$$;

create trigger booking_status_guard
  before update on bookings
  for each row execute function public.check_booking_status_change();




  -- True if the current user has at least one booking for this service.
-- SECURITY DEFINER bypasses RLS on bookings, avoiding infinite recursion between policies.
create function public.has_booked_service(sid uuid)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.bookings
    where service_id = sid and user_id = auth.uid()
  )
$$;

-- Users can read the services they have booked, even if they are now inactive
create policy "services: users read booked services"
on services for select
to authenticated
using ((select public.has_booked_service(id)));
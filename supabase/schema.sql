-- Wedding Expenses — run this once in the Supabase SQL Editor

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'other',
  supplier text not null default '',
  estimated_cost numeric(12, 2) not null default 0,
  final_cost numeric(12, 2) not null default 0,
  amount_paid numeric(12, 2) not null default 0,
  due_date date,
  status text not null default 'planned',
  notes text not null default '',
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists expenses_archived_at_idx on public.expenses (archived_at);
create index if not exists expenses_category_idx on public.expenses (category);
create index if not exists expenses_status_idx on public.expenses (status);

-- Keep updated_at fresh on every change
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
  before update on public.expenses
  for each row
  execute function public.set_updated_at();

-- Replace these with your two Google account emails
-- before enabling Google Auth in production use.
create or replace function public.is_allowed_user()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') in (
    'barmud9798@gmail.com',
    'inbirbir@gmail.com'
  );
$$;

alter table public.expenses enable row level security;

drop policy if exists "Allowed users can select expenses" on public.expenses;
create policy "Allowed users can select expenses"
  on public.expenses
  for select
  to authenticated
  using (public.is_allowed_user());

drop policy if exists "Allowed users can insert expenses" on public.expenses;
create policy "Allowed users can insert expenses"
  on public.expenses
  for insert
  to authenticated
  with check (
    public.is_allowed_user()
    and created_by = auth.uid()
  );

drop policy if exists "Allowed users can update expenses" on public.expenses;
create policy "Allowed users can update expenses"
  on public.expenses
  for update
  to authenticated
  using (public.is_allowed_user())
  with check (
    public.is_allowed_user()
    and updated_by = auth.uid()
  );

drop policy if exists "Allowed users can delete expenses" on public.expenses;
create policy "Allowed users can delete expenses"
  on public.expenses
  for delete
  to authenticated
  using (public.is_allowed_user());

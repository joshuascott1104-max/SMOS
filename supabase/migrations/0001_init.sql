-- SMOS v1 initial schema
-- Sales Manager Operating System — management layer above the CRM.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUM-ish check-constrained text columns are used instead of native enums
-- so V1 can extend allowed values without a migration that rewrites a type.
-- ---------------------------------------------------------------------------

-- =============================================================================
-- depots
-- =============================================================================
create table public.depots (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  region text not null,
  manager_id uuid, -- FK to users added after users table exists
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

-- =============================================================================
-- users (app profile, linked 1:1 to Supabase auth.users)
-- =============================================================================
create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('sales_manager', 'regional_sales_manager', 'sales_director', 'admin')),
  depot_id uuid references public.depots (id) on delete set null,
  manager_id uuid references public.users (id) on delete set null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  last_login timestamptz
);

alter table public.depots
  add constraint depots_manager_id_fkey foreign key (manager_id) references public.users (id) on delete set null;

-- =============================================================================
-- reps
-- =============================================================================
create table public.reps (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  depot_id uuid not null references public.depots (id) on delete restrict,
  manager_id uuid not null references public.users (id) on delete restrict,
  start_date date,
  monthly_target numeric(12, 2) not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  notes text,
  created_at timestamptz not null default now()
);

create index reps_depot_id_idx on public.reps (depot_id);
create index reps_manager_id_idx on public.reps (manager_id);

-- =============================================================================
-- weekly_submissions
-- =============================================================================
create table public.weekly_submissions (
  id uuid primary key default gen_random_uuid(),
  rep_id uuid not null references public.reps (id) on delete cascade,
  manager_id uuid not null references public.users (id) on delete restrict,
  week_commencing date not null,
  submitted_date date,
  biggest_win text,
  biggest_challenge text,
  support_needed text,
  manager_reviewed boolean not null default false,
  manager_notes text,
  created_at timestamptz not null default now(),
  unique (rep_id, week_commencing)
);

create index weekly_submissions_rep_id_idx on public.weekly_submissions (rep_id);
create index weekly_submissions_week_idx on public.weekly_submissions (week_commencing);

-- =============================================================================
-- strategic_opportunities
-- =============================================================================
create table public.strategic_opportunities (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.weekly_submissions (id) on delete set null,
  company_name text not null,
  rep_id uuid not null references public.reps (id) on delete cascade,
  depot_id uuid not null references public.depots (id) on delete restrict,
  estimated_monthly_revenue numeric(12, 2) not null default 0,
  stage text not null default 'data_received'
    check (stage in ('data_received', 'quoted', 'trial', 'appointment_booked', 'negotiation', 'closed_won', 'closed_lost')),
  probability integer not null default 0 check (probability >= 0 and probability <= 100),
  weighted_value numeric(14, 2) generated always as (estimated_monthly_revenue * probability / 100.0) stored,
  expected_close_month date,
  next_action text,
  support_required boolean not null default false,
  support_reason text,
  manager_notes text,
  status text not null default 'active' check (status in ('active', 'won', 'lost', 'archived')),
  last_reviewed date,
  created_at timestamptz not null default now(),
  constraint support_reason_required_chk check (support_required = false or support_reason is not null)
);

create index strategic_opportunities_rep_id_idx on public.strategic_opportunities (rep_id);
create index strategic_opportunities_depot_id_idx on public.strategic_opportunities (depot_id);
create index strategic_opportunities_status_idx on public.strategic_opportunities (status);

-- Rule: max 10 active opportunities per rep (the rep's "Top 10")
create or replace function public.enforce_top10_limit() returns trigger as $$
declare
  active_count integer;
begin
  if new.status = 'active' then
    select count(*) into active_count
    from public.strategic_opportunities
    where rep_id = new.rep_id
      and status = 'active'
      and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

    if active_count >= 10 then
      raise exception 'Rep already has 10 active strategic opportunities (Top 10 limit reached)';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger strategic_opportunities_top10_limit
  before insert or update on public.strategic_opportunities
  for each row execute function public.enforce_top10_limit();

-- =============================================================================
-- kpis
-- =============================================================================
create table public.kpis (
  id uuid primary key default gen_random_uuid(),
  rep_id uuid not null references public.reps (id) on delete cascade,
  manager_id uuid not null references public.users (id) on delete restrict,
  week_commencing date not null,
  calls integer not null default 0,
  appointments integer not null default 0,
  quotes integer not null default 0,
  wins integer not null default 0,
  revenue_won numeric(12, 2) not null default 0,
  forecast_value numeric(12, 2) not null default 0,
  conversion_rate numeric(5, 2),
  activity_score numeric(5, 2),
  performance_score numeric(5, 2),
  manager_notes text,
  created_at timestamptz not null default now(),
  unique (rep_id, week_commencing)
);

create index kpis_rep_id_idx on public.kpis (rep_id);
create index kpis_week_idx on public.kpis (week_commencing);

-- =============================================================================
-- meetings
-- =============================================================================
create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  meeting_type text not null check (meeting_type in ('monday_meeting', 'one_to_one')),
  rep_id uuid references public.reps (id) on delete cascade,
  depot_id uuid references public.depots (id) on delete set null,
  manager_id uuid not null references public.users (id) on delete restrict,
  meeting_date date not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed')),
  summary text,
  created_at timestamptz not null default now()
);

create index meetings_rep_id_idx on public.meetings (rep_id);
create index meetings_manager_id_idx on public.meetings (manager_id);

-- =============================================================================
-- meeting_notes
-- =============================================================================
create table public.meeting_notes (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  section text not null check (section in (
    'previous_actions', 'kpi_exceptions', 'top10_review', 'coaching_notes',
    'previous_objectives', 'performance', 'development', 'manager_feedback', 'rep_feedback', 'general'
  )),
  note text not null,
  created_by uuid not null references public.users (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index meeting_notes_meeting_id_idx on public.meeting_notes (meeting_id);

-- =============================================================================
-- actions  (cannot be deleted — only completed / replanned / cancelled)
-- =============================================================================
create table public.actions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  owner_type text not null check (owner_type in ('rep', 'manager')),
  owner_id uuid not null,
  created_by uuid not null references public.users (id) on delete restrict,
  linked_rep_id uuid references public.reps (id) on delete set null,
  linked_opportunity_id uuid references public.strategic_opportunities (id) on delete set null,
  linked_meeting_id uuid references public.meetings (id) on delete set null,
  due_date date not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'completed', 'replanned', 'cancelled')),
  outcome text,
  completed_date date,
  replanned_reason text,
  cancelled_reason text,
  created_at timestamptz not null default now(),
  constraint replanned_reason_required_chk check (status <> 'replanned' or replanned_reason is not null),
  constraint cancelled_reason_required_chk check (status <> 'cancelled' or cancelled_reason is not null)
);

create index actions_status_idx on public.actions (status);
create index actions_due_date_idx on public.actions (due_date);
create index actions_linked_rep_id_idx on public.actions (linked_rep_id);
create index actions_owner_idx on public.actions (owner_type, owner_id);

-- =============================================================================
-- one_to_one_reviews
-- =============================================================================
create table public.one_to_one_reviews (
  id uuid primary key default gen_random_uuid(),
  rep_id uuid not null references public.reps (id) on delete cascade,
  manager_id uuid not null references public.users (id) on delete restrict,
  review_date date not null,
  period_covered text,
  performance_summary text,
  strengths text,
  development_areas text,
  manager_feedback text,
  rep_feedback text,
  overall_rating numeric(3, 1),
  next_review_date date,
  created_at timestamptz not null default now()
);

create index one_to_one_reviews_rep_id_idx on public.one_to_one_reviews (rep_id);

-- =============================================================================
-- objectives  (max 3 active per rep)
-- =============================================================================
create table public.objectives (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references public.one_to_one_reviews (id) on delete cascade,
  rep_id uuid not null references public.reps (id) on delete cascade,
  objective text not null,
  success_measure text,
  due_date date,
  status text not null default 'not_started' check (status in ('not_started', 'on_track', 'at_risk', 'completed')),
  progress_notes text,
  created_at timestamptz not null default now()
);

create index objectives_rep_id_idx on public.objectives (rep_id);

create or replace function public.enforce_objectives_limit() returns trigger as $$
declare
  active_count integer;
begin
  if new.status <> 'completed' then
    select count(*) into active_count
    from public.objectives
    where rep_id = new.rep_id
      and status <> 'completed'
      and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

    if active_count >= 3 then
      raise exception 'Rep already has 3 active objectives (maximum reached)';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger objectives_active_limit
  before insert or update on public.objectives
  for each row execute function public.enforce_objectives_limit();

-- =============================================================================
-- forecasts
-- =============================================================================
create table public.forecasts (
  id uuid primary key default gen_random_uuid(),
  rep_id uuid references public.reps (id) on delete cascade,
  depot_id uuid references public.depots (id) on delete cascade,
  month date not null,
  target numeric(12, 2) not null default 0,
  forecast_value numeric(12, 2) not null default 0,
  weighted_forecast numeric(12, 2) not null default 0,
  gap_to_target numeric(12, 2) generated always as (target - forecast_value) stored,
  confidence text check (confidence in ('low', 'medium', 'high')),
  manager_notes text,
  created_at timestamptz not null default now(),
  constraint forecasts_rep_or_depot_chk check (rep_id is not null or depot_id is not null)
);

create index forecasts_rep_id_idx on public.forecasts (rep_id);
create index forecasts_depot_id_idx on public.forecasts (depot_id);
create index forecasts_month_idx on public.forecasts (month);

-- =============================================================================
-- Row Level Security
-- All authenticated users with an active profile in public.users can read
-- and write the operating data. SMOS is a single-tenant internal tool used
-- only by a sales management chain (managers, regional managers, directors,
-- admin) — there is no cross-tenant separation to enforce in V1.
-- Actions have no delete policy anywhere (cannot be hard-deleted, per spec).
-- =============================================================================

create or replace function public.is_active_user() returns boolean as $$
  select exists (
    select 1 from public.users
    where auth_user_id = auth.uid() and status = 'active'
  );
$$ language sql stable security definer set search_path = public;

alter table public.depots enable row level security;
alter table public.users enable row level security;
alter table public.reps enable row level security;
alter table public.weekly_submissions enable row level security;
alter table public.strategic_opportunities enable row level security;
alter table public.kpis enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_notes enable row level security;
alter table public.actions enable row level security;
alter table public.one_to_one_reviews enable row level security;
alter table public.objectives enable row level security;
alter table public.forecasts enable row level security;

create policy depots_rw on public.depots for select using (public.is_active_user());
create policy depots_insert on public.depots for insert with check (public.is_active_user());
create policy depots_update on public.depots for update using (public.is_active_user());

create policy users_select on public.users for select using (public.is_active_user());
create policy users_insert on public.users for insert with check (public.is_active_user());
create policy users_update on public.users for update using (public.is_active_user());

create policy reps_select on public.reps for select using (public.is_active_user());
create policy reps_insert on public.reps for insert with check (public.is_active_user());
create policy reps_update on public.reps for update using (public.is_active_user());

create policy weekly_submissions_select on public.weekly_submissions for select using (public.is_active_user());
create policy weekly_submissions_insert on public.weekly_submissions for insert with check (public.is_active_user());
create policy weekly_submissions_update on public.weekly_submissions for update using (public.is_active_user());

create policy strategic_opportunities_select on public.strategic_opportunities for select using (public.is_active_user());
create policy strategic_opportunities_insert on public.strategic_opportunities for insert with check (public.is_active_user());
create policy strategic_opportunities_update on public.strategic_opportunities for update using (public.is_active_user());

create policy kpis_select on public.kpis for select using (public.is_active_user());
create policy kpis_insert on public.kpis for insert with check (public.is_active_user());
create policy kpis_update on public.kpis for update using (public.is_active_user());

create policy meetings_select on public.meetings for select using (public.is_active_user());
create policy meetings_insert on public.meetings for insert with check (public.is_active_user());
create policy meetings_update on public.meetings for update using (public.is_active_user());

create policy meeting_notes_select on public.meeting_notes for select using (public.is_active_user());
create policy meeting_notes_insert on public.meeting_notes for insert with check (public.is_active_user());
create policy meeting_notes_update on public.meeting_notes for update using (public.is_active_user());

create policy actions_select on public.actions for select using (public.is_active_user());
create policy actions_insert on public.actions for insert with check (public.is_active_user());
create policy actions_update on public.actions for update using (public.is_active_user());

create policy one_to_one_reviews_select on public.one_to_one_reviews for select using (public.is_active_user());
create policy one_to_one_reviews_insert on public.one_to_one_reviews for insert with check (public.is_active_user());
create policy one_to_one_reviews_update on public.one_to_one_reviews for update using (public.is_active_user());

create policy objectives_select on public.objectives for select using (public.is_active_user());
create policy objectives_insert on public.objectives for insert with check (public.is_active_user());
create policy objectives_update on public.objectives for update using (public.is_active_user());

create policy forecasts_select on public.forecasts for select using (public.is_active_user());
create policy forecasts_insert on public.forecasts for insert with check (public.is_active_user());
create policy forecasts_update on public.forecasts for update using (public.is_active_user());

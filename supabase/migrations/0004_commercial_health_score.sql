-- Module 4: Commercial Performance & Health Score (Walkers Commercial Operating System)
--
-- Revenue vs Monthly Target, Qualified Opportunities, Discovery Meetings and
-- Proposals Issued are all derived at query time from the weekly kpis rows
-- (new columns below) plus reps.monthly_target / reps.new_customer_target —
-- no new table needed for those four. New Customers Won, Commercial Gate
-- Progression, Follow-up Compliance and CRM Discipline are entered by the
-- manager once a month per rep, captured in commercial_scores.

alter table public.reps
  add column new_customer_target integer not null default 2;

alter table public.kpis
  add column qualified_opportunities integer not null default 0,
  add column discovery_meetings integer not null default 0,
  add column proposals_issued integer not null default 0;

create table public.commercial_scores (
  id uuid primary key default gen_random_uuid(),
  rep_id uuid not null references public.reps (id) on delete cascade,
  manager_id uuid not null references public.users (id) on delete restrict,
  month date not null,
  new_customers_won integer not null default 0,
  gate_progression_pct integer not null default 0 check (gate_progression_pct >= 0 and gate_progression_pct <= 100),
  follow_up_compliance_pct integer not null default 0 check (follow_up_compliance_pct >= 0 and follow_up_compliance_pct <= 100),
  crm_discipline_pct integer not null default 0 check (crm_discipline_pct >= 0 and crm_discipline_pct <= 100),
  manager_notes text,
  created_at timestamptz not null default now(),
  unique (rep_id, month)
);

create index commercial_scores_rep_id_idx on public.commercial_scores (rep_id);
create index commercial_scores_month_idx on public.commercial_scores (month);

alter table public.commercial_scores enable row level security;

create policy commercial_scores_select on public.commercial_scores for select using (public.is_active_user());
create policy commercial_scores_insert on public.commercial_scores for insert with check (public.is_active_user());
create policy commercial_scores_update on public.commercial_scores for update using (public.is_active_user());

-- Monthly coaching review fields (WCOS "Monthly Coaching Review") extend the
-- existing 1-to-1 workflow rather than duplicating it, and link back to the
-- Commercial Health Score that was discussed.
alter table public.one_to_one_reviews
  add column support_required text,
  add column recognition_achieved text,
  add column commercial_score_id uuid references public.commercial_scores (id) on delete set null;

-- Review Scoring System for Sales Manager 1-to-1s.
--
-- This sits alongside the Commercial Health Score (Module 4) — it does not
-- replace it. It scores the manager's qualitative read of a rep during a
-- specific 1-to-1 review: performance, pipeline quality, CRM discipline,
-- follow-up quality, accountability/attitude, and agreed actions completed.
-- Each category is 1-5; total_score and rating_band are derived columns so
-- they can never drift out of sync with the six inputs.

create table public.review_scores (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null unique references public.one_to_one_reviews (id) on delete cascade,
  rep_id uuid not null references public.reps (id) on delete cascade,
  manager_id uuid not null references public.users (id) on delete restrict,
  performance_score integer not null check (performance_score between 1 and 5),
  pipeline_quality_score integer not null check (pipeline_quality_score between 1 and 5),
  crm_discipline_score integer not null check (crm_discipline_score between 1 and 5),
  follow_up_quality_score integer not null check (follow_up_quality_score between 1 and 5),
  accountability_score integer not null check (accountability_score between 1 and 5),
  agreed_actions_score integer not null check (agreed_actions_score between 1 and 5),
  total_score integer generated always as (
    performance_score + pipeline_quality_score + crm_discipline_score +
    follow_up_quality_score + accountability_score + agreed_actions_score
  ) stored,
  rating_band text generated always as (
    case
      when (performance_score + pipeline_quality_score + crm_discipline_score +
            follow_up_quality_score + accountability_score + agreed_actions_score) >= 27 then 'excellent'
      when (performance_score + pipeline_quality_score + crm_discipline_score +
            follow_up_quality_score + accountability_score + agreed_actions_score) >= 23 then 'strong'
      when (performance_score + pipeline_quality_score + crm_discipline_score +
            follow_up_quality_score + accountability_score + agreed_actions_score) >= 18 then 'on_track'
      when (performance_score + pipeline_quality_score + crm_discipline_score +
            follow_up_quality_score + accountability_score + agreed_actions_score) >= 13 then 'needs_support'
      else 'immediate_coaching'
    end
  ) stored,
  notes text,
  created_at timestamptz not null default now()
);

create index review_scores_rep_id_idx on public.review_scores (rep_id);
create index review_scores_review_id_idx on public.review_scores (review_id);

alter table public.review_scores enable row level security;

create policy review_scores_select on public.review_scores for select using (public.is_active_user());
create policy review_scores_insert on public.review_scores for insert with check (public.is_active_user());
create policy review_scores_update on public.review_scores for update using (public.is_active_user());

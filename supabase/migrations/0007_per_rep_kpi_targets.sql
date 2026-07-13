-- Per-rep editable KPI targets for the Commercial Health Score.
--
-- Qualified Opportunities, Discovery Meetings and Proposals Issued were
-- previously scored against a single hardcoded weekly target shared by
-- every rep (20/8/6). These become per-rep columns, defaulted to those same
-- values so existing scores don't change until a manager edits them.

alter table public.reps
  add column qualified_opportunities_weekly_target integer not null default 20,
  add column discovery_meetings_weekly_target integer not null default 8,
  add column proposals_issued_weekly_target integer not null default 6;

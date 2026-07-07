-- Weekly Top 10 bulk import.
--
-- Sales Managers/Admins receive each BDM's weekly Top 10 (CSV/XLSX) and bulk
-- import it rather than BDMs entering opportunities one by one. These new
-- columns let a bulk-imported opportunity carry the extra fields the import
-- template requires, and identify which week/import it came from so a new
-- week's import can supersede the previous one for that rep without
-- touching opportunities added manually (week_commencing stays null for
-- those, so they're left alone).

alter table public.strategic_opportunities
  add column current_provider text,
  add column estimated_monthly_gp numeric(12, 2),
  add column last_action text,
  add column next_action_date date,
  add column week_commencing date;

create index strategic_opportunities_week_commencing_idx on public.strategic_opportunities (week_commencing);

-- Safety-net constraint for "duplicate protection by BDM + Prospect + Week
-- commencing" — application code resolves this by updating the existing row
-- for that exact combination rather than inserting a second one, but this
-- guarantees it can never happen even under a bug or concurrent import.
create unique index strategic_opportunities_bdm_prospect_week_idx
  on public.strategic_opportunities (rep_id, lower(trim(company_name)), week_commencing)
  where week_commencing is not null;

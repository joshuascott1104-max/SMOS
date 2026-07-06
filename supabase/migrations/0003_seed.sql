-- Bootstrap admin account + sample data from SMOS Build Pack v1 section 8.
-- The bootstrap admin is created directly (rather than via admin_create_user)
-- because no user exists yet to satisfy that function's caller-is-admin check.
--
-- Replace CHANGE_ME_BOOTSTRAP_PASSWORD below with a real temporary password
-- before running this against a new project — this file is version
-- controlled, so no real credential should ever be committed here. Rotate
-- the password after first login via admin_set_user_password().

do $$
declare
  v_admin_auth_id uuid := gen_random_uuid();
  v_admin_id uuid;
  v_leeds_id uuid;
  v_manchester_id uuid;
  v_birmingham_id uuid;
  v_wakefield_id uuid;
  v_josh_id uuid;
  v_chris_id uuid;
  v_dan_id uuid;
  v_emily_id uuid;
  v_submission_id uuid;
begin
  -- bootstrap admin user (Supabase Auth + profile)
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', v_admin_auth_id, 'authenticated', 'authenticated',
    'joshua_scott1995@yahoo.co.uk', crypt('CHANGE_ME_BOOTSTRAP_PASSWORD', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', 'Josh Scott'),
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), v_admin_auth_id, v_admin_auth_id::text,
    jsonb_build_object('sub', v_admin_auth_id::text, 'email', 'joshua_scott1995@yahoo.co.uk'),
    'email', now(), now(), now()
  );

  insert into public.users (id, auth_user_id, full_name, email, role, status)
  values (gen_random_uuid(), v_admin_auth_id, 'Josh Scott', 'joshua_scott1995@yahoo.co.uk', 'admin', 'active')
  returning id into v_admin_id;

  -- depots
  insert into public.depots (id, name, region, manager_id) values (gen_random_uuid(), 'Leeds', 'Yorkshire', v_admin_id) returning id into v_leeds_id;
  insert into public.depots (id, name, region, manager_id) values (gen_random_uuid(), 'Manchester', 'North West', v_admin_id) returning id into v_manchester_id;
  insert into public.depots (id, name, region, manager_id) values (gen_random_uuid(), 'Birmingham', 'Midlands', v_admin_id) returning id into v_birmingham_id;
  insert into public.depots (id, name, region, manager_id) values (gen_random_uuid(), 'Wakefield', 'Yorkshire', v_admin_id) returning id into v_wakefield_id;

  update public.users set depot_id = v_leeds_id where id = v_admin_id;

  -- reps
  insert into public.reps (id, full_name, depot_id, manager_id, start_date, monthly_target)
  values (gen_random_uuid(), 'Josh Scott', v_leeds_id, v_admin_id, '2023-01-09', 40000)
  returning id into v_josh_id;

  insert into public.reps (id, full_name, depot_id, manager_id, start_date, monthly_target)
  values (gen_random_uuid(), 'Chris Taylor', v_manchester_id, v_admin_id, '2022-06-12', 35000)
  returning id into v_chris_id;

  insert into public.reps (id, full_name, depot_id, manager_id, start_date, monthly_target)
  values (gen_random_uuid(), 'Dan Roberts', v_birmingham_id, v_admin_id, '2021-11-03', 32000)
  returning id into v_dan_id;

  insert into public.reps (id, full_name, depot_id, manager_id, start_date, monthly_target)
  values (gen_random_uuid(), 'Emily Carter', v_wakefield_id, v_admin_id, '2024-02-19', 28000)
  returning id into v_emily_id;

  -- Friday Top 10 weekly submission for Josh Scott (current week)
  insert into public.weekly_submissions (
    id, rep_id, manager_id, week_commencing, submitted_date,
    biggest_win, biggest_challenge, support_needed, manager_reviewed
  ) values (
    gen_random_uuid(), v_josh_id, v_admin_id, date_trunc('week', current_date)::date, current_date,
    'Confirmed the Anderton Board trial start date.',
    'Turner Bianca is stalling on the appointment — needs manager backup.',
    'Joint call with Chris and Dan to close Turner Bianca.',
    true
  ) returning id into v_submission_id;

  -- sample strategic opportunities (Josh Scott / Leeds)
  insert into public.strategic_opportunities (
    submission_id, company_name, rep_id, depot_id, estimated_monthly_revenue,
    stage, probability, expected_close_month, next_action, support_required, support_reason, last_reviewed
  ) values
  (v_submission_id, 'Turner Bianca', v_josh_id, v_leeds_id, 15000, 'appointment_booked', 50,
    date_trunc('month', current_date)::date, 'Meeting with Chris and Dan', true,
    'Needs manager support to get the appointment over the line.', current_date),
  (v_submission_id, 'Anderton Board', v_josh_id, v_leeds_id, 8000, 'trial', 90,
    date_trunc('month', current_date)::date, 'Confirm 4 pallet trial', false, null, current_date),
  (v_submission_id, 'BCC', v_josh_id, v_leeds_id, 12000, 'quoted', 40,
    (date_trunc('month', current_date) + interval '1 month')::date, 'Follow up tariff', false, null, current_date),
  (v_submission_id, 'Ellard', v_josh_id, v_leeds_id, 6000, 'data_received', 30,
    (date_trunc('month', current_date) + interval '1 month')::date, 'Complete manifest comparison', true,
    'Needs manager help completing the manifest comparison.', current_date);

  -- sample actions
  insert into public.actions (title, owner_type, owner_id, created_by, linked_rep_id, due_date, priority)
  values
  ('Chase Turner Bianca before meeting', 'rep', v_josh_id, v_admin_id, v_josh_id, current_date + interval '2 days', 'high'),
  ('Review Ellard manifest comparison', 'manager', v_admin_id, v_admin_id, v_josh_id, current_date + interval '5 days', 'medium'),
  ('Confirm Anderton Board trial start date', 'rep', v_josh_id, v_admin_id, v_josh_id, current_date + interval '4 days', 'high');

  -- baseline forecast rows for the current month
  insert into public.forecasts (rep_id, depot_id, month, target, forecast_value, weighted_forecast, confidence)
  values
  (v_josh_id, v_leeds_id, date_trunc('month', current_date)::date, 40000, 41000, 24700, 'medium'),
  (v_chris_id, v_manchester_id, date_trunc('month', current_date)::date, 35000, 30000, 18000, 'medium'),
  (v_dan_id, v_birmingham_id, date_trunc('month', current_date)::date, 32000, 33500, 21000, 'high'),
  (v_emily_id, v_wakefield_id, date_trunc('month', current_date)::date, 28000, 22000, 14000, 'low');
end $$;

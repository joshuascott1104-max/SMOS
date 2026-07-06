-- SECURITY DEFINER function so the app can create managed users (Settings > Users)
-- without ever holding the service-role key client-side or server-side.
-- Only an existing active admin may call this once at least one user exists.

create or replace function public.admin_create_user(
  p_email text,
  p_password text,
  p_full_name text,
  p_role text,
  p_depot_id uuid default null,
  p_manager_id uuid default null
) returns public.users
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_auth_user_id uuid;
  v_new_user public.users;
  v_caller_role text;
begin
  select role into v_caller_role
  from public.users
  where auth_user_id = auth.uid() and status = 'active';

  if v_caller_role is distinct from 'admin' and exists (select 1 from public.users) then
    raise exception 'Only admins can create users';
  end if;

  if exists (select 1 from auth.users where email = p_email) then
    raise exception 'A user with this email already exists';
  end if;

  if p_role not in ('sales_manager', 'regional_sales_manager', 'sales_director', 'admin') then
    raise exception 'Invalid role: %', p_role;
  end if;

  v_auth_user_id := gen_random_uuid();

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', v_auth_user_id, 'authenticated', 'authenticated',
    p_email, crypt(p_password, gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', p_full_name),
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), v_auth_user_id, v_auth_user_id::text,
    jsonb_build_object('sub', v_auth_user_id::text, 'email', p_email),
    'email', now(), now(), now()
  );

  insert into public.users (auth_user_id, full_name, email, role, depot_id, manager_id, status)
  values (v_auth_user_id, p_full_name, p_email, p_role, p_depot_id, p_manager_id, 'active')
  returning * into v_new_user;

  return v_new_user;
end;
$$;

revoke all on function public.admin_create_user(text, text, text, text, uuid, uuid) from public;
grant execute on function public.admin_create_user(text, text, text, text, uuid, uuid) to authenticated;

-- Lets an admin reset a managed user's password without the service-role key.
create or replace function public.admin_set_user_password(
  p_user_id uuid,
  p_new_password text
) returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_caller_role text;
  v_target_auth_id uuid;
begin
  select role into v_caller_role
  from public.users
  where auth_user_id = auth.uid() and status = 'active';

  if v_caller_role <> 'admin' then
    raise exception 'Only admins can reset passwords';
  end if;

  select auth_user_id into v_target_auth_id from public.users where id = p_user_id;

  if v_target_auth_id is null then
    raise exception 'User not found';
  end if;

  update auth.users
  set encrypted_password = crypt(p_new_password, gen_salt('bf')), updated_at = now()
  where id = v_target_auth_id;
end;
$$;

revoke all on function public.admin_set_user_password(uuid, text) from public;
grant execute on function public.admin_set_user_password(uuid, text) to authenticated;

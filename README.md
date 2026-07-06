# SMOS — Sales Manager Operating System

The management layer above the CRM. Next.js (App Router) + Supabase.

## Local setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Sign in with the bootstrap admin account created by the seed migration
(`supabase/migrations/0003_seed.sql`): `joshua_scott1995@yahoo.co.uk`. The
temporary password was shared out-of-band when the project was provisioned —
change it after first login via Settings, or reset it with:

```sql
select public.admin_set_user_password('<user id>', 'new-password');
```

## Database

Schema, RLS policies, and business-rule triggers (Top 10 cap, objective cap,
etc.) live in `supabase/migrations/`. They've already been applied to the
Supabase project referenced by `.env.local.example`. To point at a different
Supabase project, run the migrations there in order and update the env vars.

## Deploying to Vercel

1. Import this repository into Vercel.
2. Set the two env vars from `.env.local.example` (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
3. Deploy. No service-role key or other secret is required — user creation
   goes through a `SECURITY DEFINER` Postgres function
   (`admin_create_user`), not the Supabase service-role key.

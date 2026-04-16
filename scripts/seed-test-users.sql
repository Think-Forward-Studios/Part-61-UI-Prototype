-- Seed test users for the prototype
-- Run via Supabase SQL Editor or psql
--
-- Creates:
--   1 school: "TFS Demo School"
--   1 base:   "Main Campus"
--   4 users:  admin, instructor, student, mechanic
--   Each with: auth.users + public.users + public.user_roles + public.person_profile

-- ============================================================
-- 0. Deterministic UUIDs (so script is idempotent)
-- ============================================================
do $$
declare
  v_school_id  uuid := '00000000-0000-4000-a000-000000000001';
  v_base_id    uuid := '00000000-0000-4000-a000-000000000002';
  v_admin_id   uuid := '00000000-0000-4000-a000-000000000010';
  v_instr_id   uuid := '00000000-0000-4000-a000-000000000020';
  v_student_id uuid := '00000000-0000-4000-a000-000000000030';
  v_mech_id    uuid := '00000000-0000-4000-a000-000000000040';
  v_now        timestamptz := now();
  -- bcrypt hash for 'demo' — $2a$10$ prefix, valid for Supabase Auth
  v_pw_hash    text := '$2a$10$PwGhwJHnCSrKJPMFOcavpOydfrL.jGLPVwaxKDgC1rJk7li2GESwy';
begin

  -- ============================================================
  -- 1. School + Base (skip if exists)
  -- ============================================================
  insert into public.schools (id, name, timezone, created_at, updated_at)
  values (v_school_id, 'TFS Demo School', 'America/Chicago', v_now, v_now)
  on conflict (id) do nothing;

  insert into public.bases (id, school_id, name, timezone, latitude, longitude, created_at, updated_at)
  values (v_base_id, v_school_id, 'Main Campus', 'America/Chicago', 32.8998, -97.0403, v_now, v_now)
  on conflict (id) do nothing;

  -- ============================================================
  -- 2. Auth users (Supabase auth.users table)
  -- ============================================================
  -- We insert directly with a pre-computed bcrypt hash of 'demo'.
  -- email_confirmed_at is set so users can login immediately.

  insert into auth.users (
    instance_id, id, aud, role,
    email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token
  ) values
    -- Admin
    (
      '00000000-0000-0000-0000-000000000000', v_admin_id, 'authenticated', 'authenticated',
      'admin@tfs.test', v_pw_hash, v_now,
      '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User"}',
      v_now, v_now, '', ''
    ),
    -- Instructor
    (
      '00000000-0000-0000-0000-000000000000', v_instr_id, 'authenticated', 'authenticated',
      'instructor@tfs.test', v_pw_hash, v_now,
      '{"provider":"email","providers":["email"]}', '{"full_name":"Instructor User"}',
      v_now, v_now, '', ''
    ),
    -- Student
    (
      '00000000-0000-0000-0000-000000000000', v_student_id, 'authenticated', 'authenticated',
      'student@tfs.test', v_pw_hash, v_now,
      '{"provider":"email","providers":["email"]}', '{"full_name":"Student User"}',
      v_now, v_now, '', ''
    ),
    -- Mechanic
    (
      '00000000-0000-0000-0000-000000000000', v_mech_id, 'authenticated', 'authenticated',
      'mechanic@tfs.test', v_pw_hash, v_now,
      '{"provider":"email","providers":["email"]}', '{"full_name":"Mechanic User"}',
      v_now, v_now, '', ''
    )
  on conflict (id) do nothing;

  -- auth.identities (required for email/password login)
  insert into auth.identities (
    id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
  ) values
    (v_admin_id, v_admin_id, 'admin@tfs.test', 'email',
     jsonb_build_object('sub', v_admin_id::text, 'email', 'admin@tfs.test', 'email_verified', true),
     v_now, v_now, v_now),
    (v_instr_id, v_instr_id, 'instructor@tfs.test', 'email',
     jsonb_build_object('sub', v_instr_id::text, 'email', 'instructor@tfs.test', 'email_verified', true),
     v_now, v_now, v_now),
    (v_student_id, v_student_id, 'student@tfs.test', 'email',
     jsonb_build_object('sub', v_student_id::text, 'email', 'student@tfs.test', 'email_verified', true),
     v_now, v_now, v_now),
    (v_mech_id, v_mech_id, 'mechanic@tfs.test', 'email',
     jsonb_build_object('sub', v_mech_id::text, 'email', 'mechanic@tfs.test', 'email_verified', true),
     v_now, v_now, v_now)
  on conflict (id) do nothing;

  -- ============================================================
  -- 3. Shadow users (public.users)
  -- ============================================================
  insert into public.users (id, school_id, email, full_name, status, created_at, updated_at)
  values
    (v_admin_id,   v_school_id, 'admin@tfs.test',      'Admin User',      'active', v_now, v_now),
    (v_instr_id,   v_school_id, 'instructor@tfs.test',  'Instructor User',  'active', v_now, v_now),
    (v_student_id, v_school_id, 'student@tfs.test',     'Student User',     'active', v_now, v_now),
    (v_mech_id,    v_school_id, 'mechanic@tfs.test',    'Mechanic User',    'active', v_now, v_now)
  on conflict (id) do nothing;

  -- ============================================================
  -- 4. User roles
  -- ============================================================
  insert into public.user_roles (user_id, role, is_default, created_at)
  values
    (v_admin_id,   'admin',      true, v_now),
    (v_instr_id,   'instructor', true, v_now),
    (v_student_id, 'student',    true, v_now),
    (v_mech_id,    'mechanic',   true, v_now)
  on conflict do nothing;

  -- ============================================================
  -- 5. Person profiles
  -- ============================================================
  insert into public.person_profile (user_id, school_id, first_name, last_name, created_at, updated_at)
  values
    (v_admin_id,   v_school_id, 'Admin',      'User',  v_now, v_now),
    (v_instr_id,   v_school_id, 'Instructor', 'User',  v_now, v_now),
    (v_student_id, v_school_id, 'Student',    'User',  v_now, v_now),
    (v_mech_id,    v_school_id, 'Mechanic',   'User',  v_now, v_now)
  on conflict (user_id) do nothing;

  raise notice 'Seed complete. School: %, Admin: %, Instructor: %, Student: %, Mechanic: %',
    v_school_id, v_admin_id, v_instr_id, v_student_id, v_mech_id;

end $$;

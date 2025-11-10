-- Add new roles to the app_role enum
-- This must be done in a separate transaction
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'co_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'educator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'translator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'developer';
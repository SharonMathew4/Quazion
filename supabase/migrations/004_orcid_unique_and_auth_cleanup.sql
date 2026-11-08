-- ==============================================================================
-- QUAZION MIGRATION 004 — ORCID Cryptographic Verification & Auth Hardening
-- "Exploring Knowledge Beyond Boundaries"
-- ==============================================================================

-- 1. ADD ORCID AUTHENTICATION METADATA COLUMNS
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS orcid_authenticated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS orcid_scope TEXT;

-- 2. ENFORCE STRICT 1:1 ORCID UNIQUENESS ACROSS RESEARCHER PROFILES
-- Prevents duplicate claims or account impersonation
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_orcid_unique 
  ON public.profiles(orcid) 
  WHERE orcid IS NOT NULL AND orcid <> '';

-- 3. ENSURE RLS ENFORCES OWNER-ONLY PROFILE UPDATES
-- Only the authenticated researcher or service_role can update their profile
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ==============================================================================
-- QUAZION MIGRATION 002 — Extended Profile & Social Graph
-- Adds LinkedIn-style profile fields, follows table, and saved publications
-- ==============================================================================

-- 1. EXTEND PROFILES TABLE with richer researcher metadata
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS about TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count INT NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count INT NOT NULL DEFAULT 0;

-- education JSONB schema:
--   [{ "institution": "MIT", "degree": "PhD", "field": "Quantum Physics", "start_year": 2018, "end_year": 2023 }]
--
-- experience JSONB schema:
--   [{ "title": "Postdoctoral Researcher", "organization": "CERN", "description": "...", "start_year": 2023, "end_year": null, "current": true }]
--
-- social_links JSONB schema:
--   { "twitter": "https://...", "github": "https://...", "linkedin": "https://...", "google_scholar": "https://..." }

-- 2. FOLLOWS TABLE (Social Graph)
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS follows_follower_idx ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_idx ON public.follows(following_id);

-- 3. SAVED PUBLICATIONS (Bookmarks / Reading Library)
CREATE TABLE IF NOT EXISTS public.saved_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_saved UNIQUE (user_id, publication_id)
);

CREATE INDEX IF NOT EXISTS saved_publications_user_idx ON public.saved_publications(user_id);

-- 4. ROW LEVEL SECURITY

-- Follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view follows" ON public.follows;
CREATE POLICY "Anyone can view follows"
  ON public.follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can follow" ON public.follows;
CREATE POLICY "Authenticated users can follow"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Saved Publications
ALTER TABLE public.saved_publications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their saves" ON public.saved_publications;
CREATE POLICY "Users can view their saves"
  ON public.saved_publications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save publications" ON public.saved_publications;
CREATE POLICY "Users can save publications"
  ON public.saved_publications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave publications" ON public.saved_publications;
CREATE POLICY "Users can unsave publications"
  ON public.saved_publications FOR DELETE
  USING (auth.uid() = user_id);

-- 5. FUNCTIONS to keep followers/following counts in sync

CREATE OR REPLACE FUNCTION public.handle_follow_count_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
    UPDATE public.profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_follow_counts ON public.follows;
CREATE TRIGGER trg_follow_counts
AFTER INSERT OR DELETE ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.handle_follow_count_change();


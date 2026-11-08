-- ==============================================================================
-- QUAZION DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- "Exploring Knowledge Beyond Boundaries"
-- ==============================================================================

-- 1. ENUMS (Safe idempotent creation)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('READER', 'CREATOR', 'REVIEWER', 'EDITOR', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE publication_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'PUBLISHED',
    'REVISION_REQUIRED',
    'REJECTED',
    'ARCHIVED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE publication_type AS ENUM (
    'Research Paper',
    'Review Article',
    'Scientific Note',
    'Research Report',
    'Observation Report',
    'Educational Article',
    'Tutorial',
    'Lecture Note',
    'Editorial',
    'Science Essay',
    'Commentary'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  affiliation TEXT,
  website TEXT,
  orcid TEXT,
  role user_role NOT NULL DEFAULT 'CREATOR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PUBLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  abstract TEXT NOT NULL,
  content TEXT, -- Markdown or JSON Tiptap AST
  publication_type publication_type NOT NULL DEFAULT 'Research Paper',
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status publication_status NOT NULL DEFAULT 'DRAFT',
  cover_image TEXT,
  document_url TEXT, -- PDF or file storage URL
  tags TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  views_count INT NOT NULL DEFAULT 0,
  likes_count INT NOT NULL DEFAULT 0,
  downloads_count INT NOT NULL DEFAULT 0,
  reading_time_minutes INT DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. REFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.publication_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  order_index INT NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  year INT,
  source TEXT,
  doi TEXT,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. INTERACTION LOGS (Preventing Duplicates)
CREATE TABLE IF NOT EXISTS public.publication_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_hash TEXT, -- For guest anonymous likes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_pub_like UNIQUE (publication_id, user_id),
  CONSTRAINT unique_guest_pub_like UNIQUE (publication_id, ip_hash)
);

CREATE TABLE IF NOT EXISTS public.publication_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.publication_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. FULL-TEXT SEARCH (Trigger-based for compatibility & performance)
ALTER TABLE public.publications ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION public.publications_search_vector_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.abstract, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.keywords, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_publications_search_vector ON public.publications;
CREATE TRIGGER trg_publications_search_vector
BEFORE INSERT OR UPDATE ON public.publications
FOR EACH ROW EXECUTE FUNCTION public.publications_search_vector_trigger();

CREATE INDEX IF NOT EXISTS publications_search_idx ON public.publications USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS publications_category_idx ON public.publications(category_id);
CREATE INDEX IF NOT EXISTS publications_author_idx ON public.publications(author_id);
CREATE INDEX IF NOT EXISTS publications_status_idx ON public.publications(status);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_downloads ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES:
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(NEW.id::text FROM 1 FOR 6)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    'CREATOR'
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
    username = COALESCE(public.profiles.username, EXCLUDED.username);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATEGORIES POLICIES:
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" 
  ON public.categories FOR SELECT USING (true);

-- PUBLICATIONS POLICIES:
DROP POLICY IF EXISTS "Published publications are readable by everyone" ON public.publications;
CREATE POLICY "Published publications are readable by everyone"
  ON public.publications FOR SELECT
  USING (
    status = 'PUBLISHED' 
    OR (auth.uid() IS NOT NULL AND author_id = auth.uid())
    OR (auth.jwt() ->> 'role' = 'ADMIN')
  );

DROP POLICY IF EXISTS "Creators can insert their own publications" ON public.publications;
CREATE POLICY "Creators can insert their own publications"
  ON public.publications FOR INSERT
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Creators can update their own non-published publications" ON public.publications;
CREATE POLICY "Creators can update their own non-published publications"
  ON public.publications FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Creators can delete their own drafts" ON public.publications;
CREATE POLICY "Creators can delete their own drafts"
  ON public.publications FOR DELETE
  USING (auth.uid() = author_id AND status = 'DRAFT');

-- REFERENCES POLICIES:
DROP POLICY IF EXISTS "References of visible publications are readable" ON public.publication_references;
CREATE POLICY "References of visible publications are readable"
  ON public.publication_references FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.publications p
    WHERE p.id = publication_references.publication_id
    AND (p.status = 'PUBLISHED' OR p.author_id = auth.uid())
  ));

DROP POLICY IF EXISTS "Authors can manage their publication references" ON public.publication_references;
CREATE POLICY "Authors can manage their publication references"
  ON public.publication_references FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.publications p
    WHERE p.id = publication_references.publication_id
    AND p.author_id = auth.uid()
  ));

-- INTERACTION POLICIES (Likes, Views, Downloads):
DROP POLICY IF EXISTS "Public can view and create likes" ON public.publication_likes;
CREATE POLICY "Public can view and create likes"
  ON public.publication_likes FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can record views" ON public.publication_views;
CREATE POLICY "Public can record views"
  ON public.publication_views FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can record downloads" ON public.publication_downloads;
CREATE POLICY "Public can record downloads"
  ON public.publication_downloads FOR ALL
  USING (true)
  WITH CHECK (true);

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

-- ==============================================================================
-- QUAZION MIGRATION 003 — Security Hardening, Telemetry Sync, & Peer Review
-- "Exploring Knowledge Beyond Boundaries"
-- ==============================================================================

-- 1. SEED DEFAULT SCIENTIFIC CATEGORIES
INSERT INTO public.categories (name, slug, description, icon_name)
VALUES
  ('Astrophysics', 'astrophysics', 'Physical properties, stellar evolution, compact objects, and high-energy celestial phenomena.', 'Sparkles'),
  ('Cosmology', 'cosmology', 'The origin, expansion dynamics, cosmic microwave background, and fate of the universe.', 'Globe'),
  ('Theoretical Physics', 'theoretical-physics', 'Mathematical formulations, quantum gravity, field theories, and spacetime geometry.', 'Atom'),
  ('Space Science & Exploration', 'space-science', 'Orbital mechanics, satellite instrumentation, exoplanetary systems, and robotic missions.', 'Compass'),
  ('Mathematics & Analysis', 'mathematics', 'Differential geometry, topology, numerical relativity algorithms, and statistical mechanics.', 'Binary'),
  ('Quantum Mechanics', 'quantum-mechanics', 'Subatomic state dynamics, entanglement phenomena, decoherence, and quantum optics.', 'Cpu')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name;

-- 2. EXTEND PUBLICATIONS TABLE FOR VERSIONING & PEER ENDORSEMENTS
ALTER TABLE public.publications ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;
ALTER TABLE public.publications ADD COLUMN IF NOT EXISTS changelog_notes TEXT;
ALTER TABLE public.publications ADD COLUMN IF NOT EXISTS endorsements_count INT NOT NULL DEFAULT 0;

-- 3. PEER REVIEWS TABLE (Structured Post-Publication Peer Review)
CREATE TABLE IF NOT EXISTS public.peer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  verdict TEXT NOT NULL CHECK (verdict IN ('ENDORSED', 'REVISION_REQUESTED', 'COMMENT')),
  summary TEXT NOT NULL,
  competing_interests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_reviewer_pub UNIQUE (publication_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS peer_reviews_pub_idx ON public.peer_reviews(publication_id);
CREATE INDEX IF NOT EXISTS peer_reviews_reviewer_idx ON public.peer_reviews(reviewer_id);

-- 4. PUBLICATION COMMENTS TABLE (Open Scientific Discussions)
CREATE TABLE IF NOT EXISTS public.publication_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.publication_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pub_comments_pub_idx ON public.publication_comments(publication_id);
CREATE INDEX IF NOT EXISTS pub_comments_author_idx ON public.publication_comments(author_id);

-- 5. RLS POLICIES FOR PEER REVIEWS & COMMENTS
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view peer reviews of published papers" ON public.peer_reviews;
CREATE POLICY "Public can view peer reviews of published papers"
  ON public.peer_reviews FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.publications p
    WHERE p.id = peer_reviews.publication_id
    AND (p.status = 'PUBLISHED' OR p.author_id = auth.uid())
  ));

DROP POLICY IF EXISTS "Verified reviewers and editors can submit peer reviews" ON public.peer_reviews;
CREATE POLICY "Verified reviewers and editors can submit peer reviews"
  ON public.peer_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('REVIEWER', 'EDITOR', 'ADMIN')
    )
    -- Authors cannot review their own manuscripts
    AND NOT EXISTS (
      SELECT 1 FROM public.publications p
      WHERE p.id = publication_id AND p.author_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Reviewers can update their own reviews" ON public.peer_reviews;
CREATE POLICY "Reviewers can update their own reviews"
  ON public.peer_reviews FOR UPDATE
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Public can view comments on published papers" ON public.publication_comments;
CREATE POLICY "Public can view comments on published papers"
  ON public.publication_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.publications p
    WHERE p.id = publication_comments.publication_id
    AND (p.status = 'PUBLISHED' OR p.author_id = auth.uid())
  ));

DROP POLICY IF EXISTS "Authenticated users can submit discussion comments" ON public.publication_comments;
CREATE POLICY "Authenticated users can submit discussion comments"
  ON public.publication_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update or delete their own comments" ON public.publication_comments;
CREATE POLICY "Users can update or delete their own comments"
  ON public.publication_comments FOR DELETE
  USING (auth.uid() = author_id);

-- 6. SECURITY TRIGGER: PREVENT PROFILE PRIVILEGE ESCALATION
CREATE OR REPLACE FUNCTION public.protect_profile_security_fields()
RETURNS trigger AS $$
BEGIN
  -- Prevent regular users from promoting themselves to ADMIN/EDITOR/REVIEWER
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF current_user != 'postgres' AND coalesce(auth.jwt()->>'role', '') != 'service_role' THEN
      RAISE EXCEPTION 'Privilege escalation rejected: Role cannot be updated directly.';
    END IF;
  END IF;

  -- Prevent users from fabricating their follower counts
  IF NEW.followers_count IS DISTINCT FROM OLD.followers_count OR NEW.following_count IS DISTINCT FROM OLD.following_count THEN
    IF current_user != 'postgres' AND coalesce(auth.jwt()->>'role', '') != 'service_role' THEN
      NEW.followers_count := OLD.followers_count;
      NEW.following_count := OLD.following_count;
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_security ON public.profiles;
CREATE TRIGGER trg_protect_profile_security
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_security_fields();

-- 7. SECURITY TRIGGER: PROTECT PUBLICATION TELEMETRY & AUTO-INCREMENT VERSION
CREATE OR REPLACE FUNCTION public.protect_publication_integrity()
RETURNS trigger AS $$
BEGIN
  -- Protect engagement counters from direct client-side overwriting
  IF current_user != 'postgres' AND coalesce(auth.jwt()->>'role', '') != 'service_role' THEN
    NEW.views_count := OLD.views_count;
    NEW.likes_count := OLD.likes_count;
    NEW.downloads_count := OLD.downloads_count;
    NEW.endorsements_count := OLD.endorsements_count;

    -- If editing a published paper and content/title changed, auto-increment version
    IF OLD.status = 'PUBLISHED' AND NEW.status = 'PUBLISHED' THEN
      IF NEW.title IS DISTINCT FROM OLD.title OR NEW.content IS DISTINCT FROM OLD.content OR NEW.abstract IS DISTINCT FROM OLD.abstract THEN
        NEW.version := OLD.version + 1;
      END IF;
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_publication_integrity ON public.publications;
CREATE TRIGGER trg_protect_publication_integrity
BEFORE UPDATE ON public.publications
FOR EACH ROW EXECUTE FUNCTION public.protect_publication_integrity();

-- 8. AUTOMATIC TELEMETRY TRIGGERS (Likes, Views, Downloads, Endorsements)

-- Likes Sync
CREATE OR REPLACE FUNCTION public.handle_publication_like_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.publications SET likes_count = likes_count + 1 WHERE id = NEW.publication_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.publications SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.publication_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_publication_likes_sync ON public.publication_likes;
CREATE TRIGGER trg_publication_likes_sync
AFTER INSERT OR DELETE ON public.publication_likes
FOR EACH ROW EXECUTE FUNCTION public.handle_publication_like_change();

-- Views Sync
CREATE OR REPLACE FUNCTION public.handle_publication_view_added()
RETURNS trigger AS $$
BEGIN
  UPDATE public.publications SET views_count = views_count + 1 WHERE id = NEW.publication_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_publication_views_sync ON public.publication_views;
CREATE TRIGGER trg_publication_views_sync
AFTER INSERT ON public.publication_views
FOR EACH ROW EXECUTE FUNCTION public.handle_publication_view_added();

-- Downloads Sync
CREATE OR REPLACE FUNCTION public.handle_publication_download_added()
RETURNS trigger AS $$
BEGIN
  UPDATE public.publications SET downloads_count = downloads_count + 1 WHERE id = NEW.publication_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_publication_downloads_sync ON public.publication_downloads;
CREATE TRIGGER trg_publication_downloads_sync
AFTER INSERT ON public.publication_downloads
FOR EACH ROW EXECUTE FUNCTION public.handle_publication_download_added();

-- Endorsements Sync
CREATE OR REPLACE FUNCTION public.handle_peer_review_endorsement_sync()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.verdict = 'ENDORSED' THEN
    UPDATE public.publications SET endorsements_count = endorsements_count + 1 WHERE id = NEW.publication_id;
  ELSIF TG_OP = 'DELETE' AND OLD.verdict = 'ENDORSED' THEN
    UPDATE public.publications SET endorsements_count = GREATEST(endorsements_count - 1, 0) WHERE id = OLD.publication_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.verdict != 'ENDORSED' AND NEW.verdict = 'ENDORSED' THEN
      UPDATE public.publications SET endorsements_count = endorsements_count + 1 WHERE id = NEW.publication_id;
    ELSIF OLD.verdict = 'ENDORSED' AND NEW.verdict != 'ENDORSED' THEN
      UPDATE public.publications SET endorsements_count = GREATEST(endorsements_count - 1, 0) WHERE id = NEW.publication_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_peer_review_endorsement_sync ON public.peer_reviews;
CREATE TRIGGER trg_peer_review_endorsement_sync
AFTER INSERT OR UPDATE OR DELETE ON public.peer_reviews
FOR EACH ROW EXECUTE FUNCTION public.handle_peer_review_endorsement_sync();

-- 9. SAFE RPC FUNCTIONS FOR TELEMETRY LOGGING (Deduplicated views and downloads)
CREATE OR REPLACE FUNCTION public.record_publication_view(p_pub_id UUID, p_ip_hash TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- Deduplicate: Only record if guest haven't viewed in the last 1 hour
  IF p_ip_hash IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.publication_views
      WHERE publication_id = p_pub_id
      AND ip_hash = p_ip_hash
      AND viewed_at > NOW() - INTERVAL '1 hour'
    ) THEN
      RETURN;
    END IF;
  END IF;

  INSERT INTO public.publication_views (publication_id, viewer_id, ip_hash)
  VALUES (p_pub_id, auth.uid(), p_ip_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.record_publication_download(p_pub_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.publication_downloads (publication_id, user_id)
  VALUES (p_pub_id, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. REVISE TELEMETRY RLS POLICIES TO PREVENT ANONYMOUS HIJACKING
DROP POLICY IF EXISTS "Public can view and create likes" ON public.publication_likes;
CREATE POLICY "Public can view likes"
  ON public.publication_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can toggle their own likes"
  ON public.publication_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can remove their own likes"
  ON public.publication_likes FOR DELETE
  USING (auth.uid() = user_id);

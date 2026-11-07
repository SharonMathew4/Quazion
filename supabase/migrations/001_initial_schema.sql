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


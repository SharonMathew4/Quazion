-- ==============================================================================
-- QUAZION DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- "Exploring Knowledge Beyond Boundaries"
-- ==============================================================================

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('READER', 'CREATOR', 'REVIEWER', 'EDITOR', 'ADMIN');

CREATE TYPE publication_status AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'PUBLISHED',
  'REVISION_REQUIRED',
  'REJECTED',
  'ARCHIVED'
);

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

-- 7. FULL-TEXT SEARCH INDEX
ALTER TABLE public.publications ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(abstract, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(keywords, ' '), '')), 'C')
  ) STORED;

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
-- Anyone can view public profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- CATEGORIES POLICIES:
-- Categories are public to read
CREATE POLICY "Categories are viewable by everyone" 
  ON public.categories FOR SELECT USING (true);

-- PUBLICATIONS POLICIES:
-- Readers can read published publications
CREATE POLICY "Published publications are readable by everyone"
  ON public.publications FOR SELECT
  USING (
    status = 'PUBLISHED' 
    OR (auth.uid() IS NOT NULL AND author_id = auth.uid())
    OR (auth.jwt() ->> 'role' = 'ADMIN')
  );

-- Creators can insert their own draft publications
CREATE POLICY "Creators can insert their own publications"
  ON public.publications FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Creators can update their own drafts or submitted publications
CREATE POLICY "Creators can update their own non-published publications"
  ON public.publications FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Creators can delete their own drafts
CREATE POLICY "Creators can delete their own drafts"
  ON public.publications FOR DELETE
  USING (auth.uid() = author_id AND status = 'DRAFT');

-- REFERENCES POLICIES:
CREATE POLICY "References of visible publications are readable"
  ON public.publication_references FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.publications p
    WHERE p.id = publication_references.publication_id
    AND (p.status = 'PUBLISHED' OR p.author_id = auth.uid())
  ));

CREATE POLICY "Authors can manage their publication references"
  ON public.publication_references FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.publications p
    WHERE p.id = publication_references.publication_id
    AND p.author_id = auth.uid()
  ));

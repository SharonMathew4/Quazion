-- ==============================================================================
-- QUAZION MIGRATION 005 — External Research Feed & Multi-Disciplinary Syndication
-- "Exploring Knowledge Beyond Boundaries"
-- ==============================================================================

-- 1. EXTERNAL PUBLICATIONS TABLE (Cached syndicated research from OpenAlex & arXiv)
CREATE TABLE IF NOT EXISTS public.external_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,                        -- 'openalex' | 'arxiv' | 'biorxiv'
  external_id TEXT NOT NULL,                  -- e.g. OpenAlex work ID 'W4388123456' or arXiv '2403.12345'
  doi TEXT,                                   -- Normalized lowercase DOI (e.g. '10.1038/s41586-024-00001-x')
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  abstract TEXT NOT NULL,
  category_slug TEXT NOT NULL,                -- Maps to Quazion category slugs
  authors JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { name, orcid, affiliation }
  publication_type TEXT NOT NULL DEFAULT 'Research Paper',
  published_at TIMESTAMPTZ NOT NULL,
  cover_image TEXT,
  document_url TEXT,                          -- Direct Open Access PDF URL
  source_url TEXT NOT NULL,                   -- Landing page or canonical DOI URL
  citation_count INT NOT NULL DEFAULT 0,
  trending_score FLOAT NOT NULL DEFAULT 0.0,
  is_open_access BOOLEAN NOT NULL DEFAULT true,
  license TEXT,                               -- e.g. 'cc-by', 'gold', 'green'
  raw_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_external_source_id UNIQUE (source, external_id)
);

-- Unique DOI index allowing nulls/empty
CREATE UNIQUE INDEX IF NOT EXISTS idx_external_publications_doi_unique
  ON public.external_publications (doi)
  WHERE doi IS NOT NULL AND doi <> '';

-- Fast Indexes for Sub-30ms Feed Latencies
CREATE INDEX IF NOT EXISTS idx_ext_pub_category_trending 
  ON public.external_publications (category_slug, trending_score DESC);

CREATE INDEX IF NOT EXISTS idx_ext_pub_published_at 
  ON public.external_publications (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_ext_pub_source 
  ON public.external_publications (source);

CREATE INDEX IF NOT EXISTS idx_ext_pub_slug 
  ON public.external_publications (slug);

-- Full-Text Search GIN index
CREATE INDEX IF NOT EXISTS idx_ext_pub_fts 
  ON public.external_publications USING GIN (to_tsvector('english', title || ' ' || abstract));

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.external_publications ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'external_publications' 
      AND policyname = 'Public read access for external_publications'
  ) THEN
    CREATE POLICY "Public read access for external_publications"
      ON public.external_publications
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'external_publications' 
      AND policyname = 'Service role full access for external_publications'
  ) THEN
    CREATE POLICY "Service role full access for external_publications"
      ON public.external_publications
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

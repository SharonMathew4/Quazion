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


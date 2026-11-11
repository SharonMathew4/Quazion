# QUAZION Database Architecture

## Overview
QUAZION utilizes **PostgreSQL** hosted on **Supabase**, with Row Level Security (RLS) policies enforcing zero-trust data access at the database layer.

## Schema Entities

### 1. `profiles`
Represents public user identity, authors, and researchers.
- Linked directly to `auth.users(id)` via 1-to-1 foreign key cascade.
- Holds display name, username, bio, affiliation, website, ORCID, and role (`READER`, `CREATOR`, `REVIEWER`, `EDITOR`, `ADMIN`).

### 2. `categories`
Scientific domains (e.g., Astrophysics, Cosmology, Theoretical Physics).
- Contains title, slug, and descriptions.

### 3. `publications`
The core document entity.
- Status: `DRAFT`, `SUBMITTED`, `PUBLISHED`, `REVISION_REQUIRED`, `REJECTED`, `ARCHIVED`.
- Contains title, slug, abstract, content (markdown/AST), tags, keywords, and document file URLs.
- Stores denormalized counts (`views_count`, `likes_count`, `downloads_count`) updated via atomic trigger procedures.
- Powered by a generated `tsvector` full-text search column weighted by title (A), abstract (B), and keywords (C).

### 4. `publication_references`
Normalized bibliographic citation list for each paper.

### 5. `publication_likes`, `publication_views`, `publication_downloads`
Interaction tables that prevent duplicate metrics and record engagement.

### 6. `external_publications`
High-throughput cached syndicated research from **OpenAlex** (250M+ catalog) and **arXiv**.
- Stores normalized external manuscripts with `external_id`, `source` ('openalex' | 'arxiv'), `doi`, `title`, `abstract`, `authors` (JSONB), `citation_count`, `trending_score`, and Open Access direct PDF URLs.
- Decouples external data syndication from community manuscripts to preserve zero-trust RLS isolation.
- Indexed by `category_slug`, `trending_score DESC`, `published_at DESC`, and a GIN full-text index on title and abstract for sub-30ms read latencies.

## Row Level Security (RLS) Rules
- **Public Readers**: Can execute `SELECT` on publications where `status = 'PUBLISHED'` and read all `external_publications`.
- **Creators**: Can `INSERT`, `UPDATE`, and `DELETE` their own publications while in `DRAFT` or `SUBMITTED` states. Cannot modify other users' publications.
- **Service Role**: Exclusive write access to `external_publications` for background sync workers.
- **Admins**: Can moderate, update status, and manage all records.

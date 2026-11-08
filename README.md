# QUAZION

<div align="center">

<h3><strong>Open-Access Scientific Knowledge Archive &amp; Publishing Platform</strong></h3>

<em>"Exploring Knowledge Beyond Boundaries"</em>

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![KaTeX](https://img.shields.io/badge/KaTeX-LaTeX_Math-329894?style=flat-square)](https://katex.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## Overview

**QUAZION** is a modern, open-access scientific publishing platform and research archive engineered to host peer-moderated research papers, cosmological observations, theoretical physics manuscripts, and academic essays—free of paywalls and access restrictions.

Built upon a zero-trust architecture, QUAZION connects researchers, institutions, and science enthusiasts through an editorial-grade reading interface, live arXiv data ingestion, mathematical typesetting via KaTeX, ORCID OAuth 2.0 researcher verification, and a transparent post-publication peer-review framework.

---

## Core Capabilities

- **Universal Open Access:** Unrestricted public discovery, full-text reading, citation generation, and direct PDF downloads without forced subscription paywalls or mandatory account walls.
- **Scientific Taxonomies:** Domain-specific categorization covering Astrophysics, Cosmology, Theoretical Physics, Quantum Mechanics, Space Science & Exploration, and Mathematics.
- **Creator Studio & Manuscript Pipeline:** Dedicated researcher workspace (`/creator/publications/new`, `/creator/publications/[id]/edit`) for authoring, updating, categorizing, tagging, and submitting papers through a structured lifecycle (`DRAFT` &rarr; `SUBMITTED` &rarr; `PUBLISHED`).
- **Live arXiv Research Ingestion:** High-throughput integration with the official arXiv API (`/api/arxiv`) to retrieve, index, and explore live open-access preprints and bibliographic metadata.
- **Mathematical Formula Rendering:** Native KaTeX integration rendering inline (`$...$`) and display block (`$$...$$`) LaTeX formulas and equations with academic typesetting fidelity.
- **Structured Peer Review & Discussions:** Dedicated post-publication peer-review audit ledger (`peer_reviews`) supporting double-blind assessments, formal verdicts (`ENDORSED`, `REVISION_REQUESTED`, `COMMENT`), competing interest disclosures, and threaded scientific debate.
- **Researcher Identity & ORCID OAuth 2.0:** Verified contributor profiles with institutional affiliations, public research portfolios, and 3-legged ORCID authentication (`/auth/orcid`) enforcing unique ORCID attribution.
- **Weighted Full-Text Search:** PostgreSQL GIN indexes and weighted `tsvector` query parsing across publication titles (Weight A), abstracts (Weight B), and keywords (Weight C).
- **Secure Document Storage:** Supabase Storage integration with dedicated `manuscripts` bucket policies managing 50MB PDF attachments, public access streams, and author-isolated permissions.
- **Zero-Trust Security (RLS):** Fine-grained database-level Row Level Security policies ensuring unsubmitted drafts and reviewer identities remain strictly partitioned.

---

## Technical Architecture

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) | App Router architecture, React Server Components, and Next.js 16 proxy routing |
| **UI Library** | [React 19](https://react.dev/) | Concurrent rendering primitives and action hooks |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | End-to-end type safety and domain model validation |
| **Styling & Theme** | [Tailwind CSS v4](https://tailwindcss.com/) | Print-grade academic editorial design system, typography scales, and custom CSS variables |
| **Mathematical Typesetting** | [KaTeX](https://katex.org/) | Fast, standards-compliant LaTeX mathematical notation parser and renderer |
| **Database & Auth** | [Supabase](https://supabase.com/) | PostgreSQL 15+, Row Level Security (RLS), Supabase Auth SSR, and GoTrue session management |
| **Identity Verification** | [ORCID API](https://orcid.org/) | RFC 6749 OAuth 2.0 authorization code flow with the ORCID Public API |
| **External Repositories** | [arXiv API](https://arxiv.org/help/api) | Real-time Open Archives Initiative (OAI) query ingestion for scholarly preprints |
| **Icons & Media** | [Lucide React](https://lucide.dev/) | Clean, accessible iconography |
| **Edge Proxy** | Next.js 16 `proxy.ts` | Edge route guard enforcing authenticated session validation across studio endpoints |
| **Bundling** | Webpack (`--webpack`) | Production build pipeline configured for cross-platform stability |

---

## Project Structure

```text
quazion/
├── app/                              # Next.js App Router routes & layouts
│   ├── about/                        # Mission, editorial ethics, and platform background
│   ├── api/                          # Backend API route handlers
│   │   ├── arxiv/                    # arXiv API ingestion and query proxy
│   │   └── auth/orcid/complete/      # Server-side ORCID OAuth token exchange
│   ├── auth/                         # Authentication workflows
│   │   ├── callback/                 # Supabase session exchange route handler
│   │   ├── login/                    # Credential and magic link authentication
│   │   ├── signup/                   # Contributor onboarding
│   │   └── orcid/                    # 3-legged ORCID authorization & callback handlers
│   ├── contributors/                 # Contributor index & public [username] researcher profiles
│   ├── creator/                      # Authenticated publishing studio
│   │   ├── dashboard/                # Author analytics, review status, and draft pipeline
│   │   └── publications/
│   │       ├── [id]/edit/            # Manuscript editor & metadata updater
│   │       └── new/                  # Publication drafting and submission portal
│   ├── explore/                      # Discipline taxonomy and category browser
│   ├── publications/                 # Publication archive & [slug] academic reader
│   ├── search/                       # Weighted full-text search interface
│   ├── globals.css                   # Tailwind v4 theme tokens & editorial styles
│   ├── layout.tsx                    # Two-tier institutional header, root layout & footer
│   └── page.tsx                      # Magazine cover, live pulse bar, and research feed
├── components/                       # Modular UI component hierarchy
│   ├── auth/                         # Security controls and URL token scrubber
│   ├── home/                         # Editorial hero, pulse bar, feeds, and showcase
│   ├── layout/                       # Institutional header, navbar, and colophon footer
│   ├── navigation/                   # Authenticated session user controls
│   ├── publications/                 # Math renderer, peer review audit, modal reader, cards
│   └── ui/                           # Base UI primitives (buttons, badges)
├── docs/                             # Architecture and technical specifications
│   ├── database/schema.md            # Entity-relationship details and RLS definitions
│   └── PROJECT_AUDIT.md              # Technical audit and design benchmarks
├── lib/                              # Client utilities, services, and integrations
│   ├── supabase/                     # SSR, browser, and service-role Supabase clients
│   ├── arxiv.ts                      # arXiv query parser and transformer
│   ├── mock-data.ts                  # Demonstration dataset and fallback fixtures
│   ├── orcid.ts                      # RFC 6749 ORCID OAuth 2.0 configuration
│   ├── security-errors.ts            # Sanitized error handler for client surfaces
│   └── utils.ts                      # Formatting, class merging, and date helpers
├── public/                           # Static assets, branding, and vector marks
├── supabase/                         # Database schema migrations & infrastructure
│   ├── migrations/
│   │   ├── 001_initial_schema.sql    # Base schema, enums, triggers, and GIN indexes
│   │   ├── 002_extended_profile.sql  # Extended profile fields and social attribution
│   │   ├── 003_security_telemetry.sql# Peer review ledger, comments, and telemetry
│   │   └── 004_orcid_unique.sql      # Unique ORCID constraint and auth hardening
│   ├── full_setup_all_in_one.sql     # Consolidated turnkey deployment script
│   └── storage_setup.sql             # Manuscripts storage bucket and access policies
├── types/                            # Domain TypeScript type definitions
├── proxy.ts                          # Next.js 16 route proxy and session validator
├── package.json
└── tsconfig.json
```

---

## Database Architecture & Access Control

Data persistence is managed by **PostgreSQL** on **Supabase** with Row Level Security (RLS) enforcing boundary validation at the query engine level.

### Primary Entities

- **`profiles`**: Linked 1:1 with `auth.users`, storing researcher credentials, bios, affiliations, websites, roles, and unique ORCID records.
- **`categories`**: Standardized scientific domains (Astrophysics, Cosmology, Theoretical Physics, etc.).
- **`publications`**: Academic manuscripts tracking lifecycle states:
  $$\text{DRAFT} \longrightarrow \text{SUBMITTED} \longrightarrow \text{PUBLISHED}$$
  *(along with `REVISION_REQUIRED`, `REJECTED`, and `ARCHIVED` moderation states)*.
- **`peer_reviews`**: Formal evaluations recording reviewer verdicts (`ENDORSED`, `REVISION_REQUESTED`, `COMMENT`), summaries, and competing interest disclosures.
- **`publication_comments`**: Threaded, open scientific discourse linked to publications.
- **`publication_references`**: Bibliographic references, external source links, and DOI citations.
- **`publication_likes`, `publication_views`, `publication_downloads`**: Interaction telemetry with client hash deduplication.

### User Roles & Permissions

| Role | Scope & Permissions |
| :--- | :--- |
| `READER` | Public exploration, manuscript reading, citation export, and asset downloads |
| `CREATOR` | Authors and maintains personal drafts; submits manuscripts for editorial review |
| `REVIEWER` | Conducts structured peer reviews and submits formal verdicts |
| `EDITOR` | Manages domain taxonomies, peer review assignments, and approval pipelines |
| `ADMIN` | Platform-wide governance, user moderation, and schema configuration |

---

## Getting Started

### Prerequisites

- **[Node.js](https://nodejs.org/)** (v20.x or higher recommended)
- **[npm](https://www.npmjs.com/)**, **[pnpm](https://pnpm.io/)**, or **[yarn](https://yarnpkg.com/)**
- A **[Supabase](https://supabase.com/)** project instance
- *(Optional)* An **[ORCID Developer](https://orcid.org/developer-tools)** client for researcher authentication

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/quazion.git
cd quazion
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env.local` by copying the template file:

```bash
cp .env.example .env.local
```

Populate the required configuration keys:

```env
# -----------------------------------------------------------------------------
# Supabase Configuration
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# -----------------------------------------------------------------------------
# ORCID OAuth 2.0 (Academic Verification)
# -----------------------------------------------------------------------------
NEXT_PUBLIC_ORCID_CLIENT_ID=APP-XXXXXXXXXXXXXXXX
ORCID_CLIENT_SECRET=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_ORCID_ENV=sandbox # Use "sandbox" for dev, "production" for live
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database & Storage Initialization

You can provision your Supabase instance using either the consolidated script or step-by-step migrations via the **Supabase Dashboard SQL Editor** or Supabase CLI:

#### Option A: Turnkey Setup (Recommended)
1. Run `supabase/full_setup_all_in_one.sql` to initialize all tables, roles, full-text indexes, triggers, and RLS policies.
2. Run `supabase/storage_setup.sql` to provision the `manuscripts` bucket and storage access rules.

#### Option B: Sequential Migrations
Execute each migration in sequence from `supabase/migrations/`:
1. `001_initial_schema.sql` — Schema primitives, enums, triggers, and full-text index.
2. `002_extended_profile_social.sql` — Extended profile attributes and social links.
3. `003_security_telemetry_peer_review.sql` — Category seeds, peer review ledger, and comments.
4. `004_orcid_unique_and_auth_cleanup.sql` — ORCID uniqueness constraint and auth synchronization.
5. `supabase/storage_setup.sql` — Storage bucket configuration for manuscript PDFs.

### 5. Run the Development Server

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Webpack on `http://localhost:3000` |
| `npm run build` | Compiles and optimizes the production build bundle |
| `npm run start` | Boots the compiled production server |
| `npm run lint` | Runs ESLint across all codebase modules to verify syntax and conventions |

---

## Security & Architecture Highlights

- **Edge Proxy Route Protection:** Next.js 16 `proxy.ts` performs edge-level token and session verification, redirecting unauthorized traffic before entering `/creator` studio routes.
- **Client Sanitization:** `lib/security-errors.ts` filters out internal database exceptions, schema names, and connection strings from user-facing surfaces.
- **Token Scrubbing:** `components/auth/auth-hash-scrubber.tsx` clears authentication hash fragments (`#access_token=...`) from browser history after successful authentication.
- **ORCID Collision Prevention:** Database unique constraints prevent duplicate ORCID profile registrations across accounts.

---

## Roadmap

- [ ] **Crossref & DataCite Integration:** Automatic Digital Object Identifier (DOI) registration and metadata syndication.
- [ ] **Dynamic PDF Generation:** In-browser compilation of submitted manuscripts into print-ready PDF preprints with standardized academic headers.
- [ ] **Decentralized Archival Preservation:** Redundant preservation of published research via IPFS and Arweave storage networks.
- [ ] **Advanced BibTeX & EndNote Exporter:** Direct one-click citation exports in standard BibTeX, RIS, and APA formats.

---

## Core Development Team

The platform is actively engineered and maintained by:

<div align="center">

| Contributor | Profile | Role |
| :---: | :--- | :--- |
| <a href="https://github.com/SharonMathew4"><img src="https://github.com/SharonMathew4.png?size=120" width="80" height="80" alt="Sharon P Mathew" style="border-radius: 50%;" /><br />**Sharon P Mathew**</a> | [@SharonMathew4](https://github.com/SharonMathew4) | Core Developer & Platform Architecture |
| <a href="https://github.com/mfscpayload-690"><img src="https://github.com/mfscpayload-690.png?size=120" width="80" height="80" alt="Aravind Lal" style="border-radius: 50%;" /><br />**Aravind Lal**</a> | [@mfscpayload-690](https://github.com/mfscpayload-690) | Core Developer & Systems Engineering |

</div>

---

## Contributing

Contributions from the scientific computing and open-source communities are welcome.

1. Fork the repository.
2. Create your dedicated branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes following standard conventional commits:
   ```bash
   git commit -m "feat(reader): introduce enhanced bibliographic references"
   ```
4. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Submit a detailed Pull Request.

---

## License

This project is licensed under the [MIT License](LICENSE).

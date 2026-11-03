# QUAZION

<div align="center">

<h3><strong>Open Scientific Knowledge &amp; Publishing Platform</strong></h3>

> *"Exploring Knowledge Beyond Boundaries"*

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

## 🌌 Overview

**QUAZION** is an open-access scientific knowledge archive and publishing platform designed to host peer-moderated research papers, cosmological observations, theoretical physics manuscripts, educational science essays, and lecture notes—**completely free of paywalls**.

Built with a modern web architecture, QUAZION provides researchers, educators, and science enthusiasts with an intuitive portal to discover, publish, cite, and discuss cutting-edge scientific work.

---

## ✨ Key Features

- **📖 Universal Open Access:** Unrestricted public access to all published papers, abstracts, citations, and downloads without forced paywalls or mandatory sign-ups.
- **🔬 Rich Publication Categories:** Specialized taxonomies spanning Astrophysics, Cosmology, Theoretical Physics, Quantum Mechanics, Space Exploration, and Mathematics.
- **✍️ Creator Publishing Studio:** Dedicated authoring workspace (`/creator/publications/new`) allowing researchers to draft, categorize, tag, reference, and submit papers for review.
- **📊 Real-time Creator Dashboard:** Analytics dashboard (`/creator/dashboard`) tracking read times, views, community likes, and PDF/asset downloads.
- **🔎 Weighted Full-Text Search:** High-performance full-text search powered by PostgreSQL GIN indexes and weighted `tsvector` queries across paper titles, abstracts, and keywords.
- **👤 Verified Contributor Profiles:** Researcher profiles displaying academic affiliations, bios, external portfolios, and verified ORCID identifiers.
- **📑 Citation & Reference Engine:** Standardized bibliographic citations with DOI support and direct source linking.
- **🛡️ Zero-Trust Security (RLS):** Database-layer Row Level Security policies guaranteeing that unpublished drafts remain strictly private to authorized authors.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Components & Client Scaffolding) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict type safety) |
| **UI & Styling** | [Tailwind CSS v4](https://tailwindcss.com/), Custom Cosmic Design System |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL 15+, Row Level Security, Auth SSR) |
| **Bundler** | Webpack (`--webpack` mode for seamless Windows SWC compatibility) |

---

## 📂 Project Structure

```text
quazion/
├── app/                              # Next.js App Router routes & layouts
│   ├── about/                        # About & platform mission page
│   ├── auth/                         # Authentication & OAuth callback handlers
│   │   ├── callback/                 # Supabase exchange code route handler
│   │   └── login/                    # Magic link & password authentication
│   ├── contributors/                 # Contributor directory & [username] profiles
│   ├── creator/                      # Creator studio
│   │   ├── dashboard/                # Author analytics & publication pipeline
│   │   └── publications/new/         # New paper authoring & submission form
│   ├── explore/                      # Scientific category browser
│   ├── publications/                 # Paper listings & [slug] reading page
│   ├── search/                       # Weighted search interface
│   ├── globals.css                   # Tailwind v4 directives & cosmic theme styles
│   ├── layout.tsx                    # Root layout with navigation & footer
│   └── page.tsx                      # Platform landing page
├── components/                       # Modular UI components
│   ├── home/                         # Landing page sections (Hero, Featured, etc.)
│   ├── layout/                       # Navbar & Footer
│   ├── navigation/                   # Auth & user dropdown controls
│   ├── publications/                 # Publication cards, viewer, header, stats, tags
│   └── ui/                           # Base UI primitives (buttons, badges)
├── docs/                             # Architecture and schema documentation
│   └── database/schema.md            # Database entity details & RLS specifications
├── lib/                              # Utility functions & API clients
│   ├── supabase/                     # Browser and SSR server Supabase clients
│   ├── mock-data.ts                  # Demonstration dataset for rapid scaffolding
│   └── utils.ts                      # Class merging & general helpers
├── public/                           # Static assets, logos, and vector illustrations
├── supabase/
│   └── migrations/                   # SQL migration scripts & RLS policy definitions
│       └── 001_initial_schema.sql    # Schema, enums, triggers, and full-text indexes
├── types/                            # TypeScript interfaces & domain types
├── package.json
└── tsconfig.json
```

---

## 🗄️ Database Architecture & Security

QUAZION uses **PostgreSQL** hosted via **Supabase**. Security is enforced directly at the database layer via Row Level Security (RLS).

### Core Entities:
- **`profiles`**: Linked 1-to-1 with `auth.users`, storing researcher bios, affiliations, websites, roles, and ORCID records.
- **`categories`**: Taxonomy domains (Astrophysics, Quantum Mechanics, etc.).
- **`publications`**: Scientific papers with lifecycle states:
  - `DRAFT` ➔ `SUBMITTED` ➔ `PUBLISHED` (or `REVISION_REQUIRED` / `REJECTED` / `ARCHIVED`)
- **`publication_references`**: Bibliographic citations linked to each paper.
- **`publication_likes`**, **`publication_views`**, **`publication_downloads`**: Metrics tables with guest hash deduplication.

### User Roles:
- `READER`: Public exploration, paper reading, citations, and downloads.
- `CREATOR`: Can author, draft, and submit research papers.
- `REVIEWER`: Peer-review submissions and request revisions.
- `EDITOR`: Manage categorization and publication approvals.
- `ADMIN`: Global administration, user management, and moderation.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **[Node.js](https://nodejs.org/)** (v20.x or higher recommended)
- **[npm](https://www.npmjs.com/)** or **[pnpm](https://pnpm.io/)**
- A **[Supabase](https://supabase.com/)** account (or local Supabase CLI instance)

### 1. Clone & Navigate to the Project

```bash
git clone https://github.com/your-username/quazion.git
cd quazion
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Duplicate `.env.example` to create your local `.env.local` file:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```env
# Public Supabase Client (Browser Safe)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Server-side Supabase Service Role Key (Keep secret!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Apply Database Migrations

Open the **SQL Editor** in your Supabase Dashboard (or use the Supabase CLI) and execute the migration file located at:

```text
supabase/migrations/001_initial_schema.sql
```

This will initialize all required tables, enums, automated timestamps, full-text search indexes, and RLS security policies.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the platform.

> [!NOTE]
> `npm run dev` and `npm run build` are preconfigured with the `--webpack` flag in `package.json` to guarantee reliable operation across all operating systems (including native Windows environments).

---

## 📜 Available Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on `http://localhost:3000` |
| `npm run build` | Compiles the production application bundle with Webpack |
| `npm run start` | Runs the compiled production server |
| `npm run lint` | Runs ESLint to check for code quality and convention adherence |

---

## 🗺️ Roadmap & Upcoming Milestones

- [ ] **LaTeX / KaTeX Equation Support:** Native inline and block rendering for mathematical proofs and physical equations.
- [ ] **Automated PDF Paper Generation:** Dynamic print-ready PDF generation with academic headers and citation footers.
- [ ] **DOI Minting:** Integration with Crossref / DataCite for automatic Digital Object Identifier assignment upon publication.
- [ ] **Decentralized Archival (IPFS / Arweave):** Immutable decentralized preservation of open-access publications.
- [ ] **Interactive Peer Review Workflow:** In-platform commenting, line-by-line review notes, and revision diff tracking.

---

## 🤝 Contributing

Contributions are welcomed from the scientific and open-source communities. Whether you are improving documentation, reporting bugs, or proposing new research features:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/ScientificNotation`)
3. Commit your Changes (`git commit -m "Add LaTeX math renderer"`)
4. Push to the Branch (`git push origin feature/ScientificNotation`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free for use, modification, and open distribution.

---

<div align="center">
  <sub>Built with dedication for scientific discovery and open knowledge sharing.</sub>
</div>

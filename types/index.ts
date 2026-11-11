/**
 * Core domain types for QUAZION
 * "Exploring Knowledge Beyond Boundaries"
 */

export type UserRole = "READER" | "CREATOR" | "REVIEWER" | "EDITOR" | "ADMIN";

export type PublicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PUBLISHED"
  | "REVISION_REQUIRED"
  | "REJECTED"
  | "ARCHIVED";

export type PublicationType =
  | "Research Paper"
  | "Review Article"
  | "Scientific Note"
  | "Research Report"
  | "Observation Report"
  | "Educational Article"
  | "Tutorial"
  | "Lecture Note"
  | "Editorial"
  | "Science Essay"
  | "Commentary";

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  startYear?: number;
  endYear?: number;
}

export interface ExperienceEntry {
  title: string;
  organization: string;
  description?: string;
  startYear?: number;
  endYear?: number;
  current?: boolean;
}

export interface SocialLinks {
  twitter?: string;
  github?: string;
  linkedin?: string;
  googleScholar?: string;
  researchGate?: string;
}

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  headline?: string;
  about?: string;
  affiliation?: string;
  location?: string;
  website?: string;
  orcid?: string;
  role: UserRole;
  skills?: string[];
  interests?: string[];
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  socialLinks?: SocialLinks;
  followersCount?: number;
  followingCount?: number;
  createdAt: string;
  totalPublications?: number;
  totalViews?: number;
  totalLikes?: number;
  totalDownloads?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName?: string;
  publicationCount?: number;
}

export interface Reference {
  id: string;
  title: string;
  authors: string;
  year?: number;
  source?: string;
  doi?: string;
  url?: string;
}

export interface Publication {
  id: string;
  title: string;
  slug: string;
  abstract: string;
  content?: string;
  publicationType: PublicationType;
  category: Category;
  tags: string[];
  keywords: string[];
  author: Profile;
  status: PublicationStatus;
  coverImage?: string;
  documentUrl?: string;
  references?: Reference[];
  views: number;
  likes: number;
  downloads: number;
  version?: number;
  changelogNotes?: string;
  endorsementsCount?: number;
  createdAt: string;
  publishedAt?: string;
  updatedAt?: string;
  readingTimeMinutes?: number;
  sourceName?: string;
  sourceUrl?: string;
  isExternal?: boolean;
  externalId?: string;
  doi?: string;
  citationCount?: number;
  isOpenAccess?: boolean;
  trendingScore?: number;
}

export interface ExternalAuthor {
  name: string;
  orcid?: string;
  affiliation?: string;
}

export interface ExternalPublicationRecord {
  id: string;
  source: "openalex" | "arxiv" | "biorxiv";
  external_id: string;
  doi?: string | null;
  title: string;
  slug: string;
  abstract: string;
  category_slug: string;
  authors: ExternalAuthor[];
  publication_type: string;
  published_at: string;
  cover_image?: string | null;
  document_url?: string | null;
  source_url: string;
  citation_count: number;
  trending_score: number;
  is_open_access: boolean;
  license?: string | null;
  raw_metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type PeerReviewVerdict = "ENDORSED" | "REVISION_REQUESTED" | "COMMENT";

export interface PeerReview {
  id: string;
  publicationId: string;
  reviewer: Profile;
  verdict: PeerReviewVerdict;
  summary: string;
  competingInterests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicationComment {
  id: string;
  publicationId: string;
  author: Profile;
  parentId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

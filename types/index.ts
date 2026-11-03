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

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  affiliation?: string;
  website?: string;
  orcid?: string;
  role: UserRole;
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
  createdAt: string;
  publishedAt?: string;
  updatedAt?: string;
  readingTimeMinutes?: number;
}

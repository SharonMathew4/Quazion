import React from "react";
import { HeroSection } from "@/components/home/hero-section";
import { CategorySection } from "@/components/home/category-section";
import { FeaturedPublications } from "@/components/home/featured-publications";
import { LatestPublications } from "@/components/home/latest-publications";
import { FeaturedContributors } from "@/components/home/featured-contributors";
import { ContributionCta } from "@/components/home/contribution-cta";
import {
  MOCK_CATEGORIES,
  MOCK_FEATURED_PUBLICATIONS,
  MOCK_LATEST_PUBLICATIONS,
  MOCK_FEATURED_CONTRIBUTORS,
} from "@/lib/mock-data";

/**
 * QUAZION MODULE 02 — VISUAL IDENTITY AND HOMEPAGE
 * Brand: QUAZION
 * Tagline: Exploring Knowledge Beyond Boundaries
 *
 * All data rendered on this page is TEMPORARY MOCK DATA cleanly imported from @/lib/mock-data.
 * Supabase database connections are deferred to Module 03.
 */
export default function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20 overflow-hidden">
      {/* 1. Hero Section + Branding + Tagline + Global Search Bar UI (Sections 2, 3, 4) */}
      <HeroSection />

      {/* 2. Scientific Category Section (Section 5) */}
      <CategorySection categories={MOCK_CATEGORIES} />

      {/* 3. Featured Publications Section (Section 6) */}
      <FeaturedPublications publications={MOCK_FEATURED_PUBLICATIONS} />

      {/* 4. Latest Publications Section (Section 7) */}
      <LatestPublications publications={MOCK_LATEST_PUBLICATIONS} />

      {/* 5. Featured Contributors Section (Section 8) */}
      <FeaturedContributors contributors={MOCK_FEATURED_CONTRIBUTORS} />

      {/* 6. Contribution Call to Action Banner (Section 9) */}
      <ContributionCta />
    </div>
  );
}

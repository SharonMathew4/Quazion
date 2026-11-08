"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "@/public/logo.png";
import {
  Search,
  Menu,
  X,
  Compass,
  BookOpen,
  Users,
  Info,
  FileText,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthNav } from "@/components/navigation/auth-nav";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Articles", href: "/publications", icon: BookOpen },
    { name: "Disciplines", href: "/explore", icon: Compass },
    { name: "Editorial", href: "/contributors", icon: Users },
    { name: "About", href: "/about", icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-2xs">
      {/* ──────────────── Top Institutional Utility Ribbon ──────────────── */}
      <div className="w-full bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-7.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-slate-800 tracking-wide uppercase text-[10px]">
              Open Science Archive
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 hidden sm:inline">
              Preprint &amp; Peer-Review Repository
            </span>
            <span className="text-slate-300 hidden md:inline">•</span>
            <span className="hidden md:flex items-center gap-1 text-slate-600 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Open Access (CC BY 4.0)</span>
            </span>
          </div>

          <div className="flex items-center gap-3.5 text-slate-500">
            <Link
              href="/about#guidelines"
              className="hover:text-slate-900 transition-colors hidden sm:inline"
            >
              Author Guidelines
            </Link>
            <span className="text-slate-200 hidden sm:inline">|</span>
            <Link
              href="/about#institutions"
              className="hover:text-slate-900 transition-colors hidden md:inline"
            >
              Institutional Access
            </Link>
            <span className="text-slate-200 hidden md:inline">|</span>
            <a
              href="https://orcid.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 flex items-center gap-1.5 transition-colors font-medium text-slate-700"
            >
              <span className="w-2 h-2 rounded-full bg-[#a6ce39] inline-block shrink-0" />
              <span>ORCID Verified</span>
            </a>
          </div>
        </div>
      </div>

      {/* ──────────────── Main Academic Masthead ──────────────── */}
      <div className="w-full border-b border-slate-200/90 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-6">
          
          {/* Brand & Wordmark */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded bg-white border border-slate-200 p-1 group-hover:border-rose-700 group-hover:shadow-2xs transition-all duration-200">
              <Image
                src={logoImg}
                alt="QUAZION Logo"
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl sm:text-2xl tracking-tight text-slate-900 group-hover:text-rose-700 transition-colors leading-none">
                QUAZION
              </span>
              <span className="text-[9px] uppercase tracking-widest text-rose-800 font-semibold mt-1 hidden sm:inline font-sans">
                Journal of Open Scientific Inquiry
              </span>
            </div>
          </Link>

          {/* Desktop Academic Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 py-1.5 rounded text-[13px] font-semibold text-slate-700 hover:text-rose-700 hover:bg-slate-50 transition-colors whitespace-nowrap font-sans"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Section */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {/* Compact Search Trigger */}
            <Link
              href="/search"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-white text-xs font-medium text-slate-600 hover:text-slate-900 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
              title="Search Archive (Press /)"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Search</span>
              <kbd className="text-[10px] bg-white px-1.5 py-0.2 rounded text-slate-400 border border-slate-200 font-mono">
                /
              </kbd>
            </Link>

            {/* Auth + Submit Manuscript */}
            <AuthNav />
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-600 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── Mobile Drawer Menu ──────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg">
          <div>
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-600"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Search publications, DOIs, authors...</span>
            </Link>
          </div>

          <div className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-50 hover:text-rose-700"
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <Link
              href="/creator/publications/new"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant="primary" size="md" className="w-full flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Submit Manuscript</span>
              </Button>
            </Link>
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant="outline" size="md" className="w-full">
                Sign In with ORCID / Credentials
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

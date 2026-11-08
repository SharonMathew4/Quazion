"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Menu,
  X,
  Compass,
  BookOpen,
  Users,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthNav } from "@/components/navigation/auth-nav";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Publications", href: "/publications", icon: BookOpen },
    { name: "Contributors", href: "/contributors", icon: Users },
    { name: "About", href: "/about", icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#06080d]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900/80 border border-slate-700/60 p-1 group-hover:border-sky-500/60 group-hover:shadow-[0_0_22px_rgba(56,189,248,0.28)] transition-all duration-300">
            <Image
              src="/icon.svg"
              alt="QUAZION Logo"
              width={36}
              height={36}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-bold text-lg tracking-wider text-slate-100 flex items-center gap-1.5 font-mono group-hover:text-sky-300 transition-colors">
              QUAZION
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium -mt-1">
              Open Science Archive
            </span>
          </div>
          <span className="sm:hidden font-bold text-base tracking-wider text-slate-100 font-mono group-hover:text-sky-300 transition-colors">
            QUAZION
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Section */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/search"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search archive...</span>
            <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
              /
            </kbd>
          </Link>

          <AuthNav />
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#06080d]/95 px-4 pt-2 pb-6 space-y-3">
          <div className="pt-2 pb-1">
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-sm text-slate-400"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search publications, authors, topics...</span>
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
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800/70"
                >
                  <Icon className="w-5 h-5 text-sky-400" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 flex gap-2">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button variant="primary" size="md" className="w-full">
                Sign In / Creator Studio
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

"use client"

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKey);
      setTimeout(() => firstLinkRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[var(--gold)] text-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl tracking-tight site-title">Destination College</div>
          <nav className="hidden md:flex gap-6 items-center text-gray-700">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <Link href="/programs" className="hover:text-gray-900">Programs</Link>
            <Link href="/about" className="hover:text-gray-900">About</Link>
            <Link href="/resources" className="hover:text-gray-900">Resources</Link>
            <Link
              href="/donate"
              className="ml-2 btn-crimson inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
            >
              Donate
            </Link>
          </nav>
          <div className="md:hidden">
            <button
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((s) => !s)}
              className="text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/60"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>
      <div className="h-1" style={{ background: 'var(--gold)' }} />

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <aside className="fixed top-0 right-0 z-50 h-full w-4/5 max-w-xs bg-white text-gray-900 p-6 shadow-2xl border-l border-[var(--gold)]/40">
            <nav className="flex flex-col gap-4">
              <Link href="/" ref={firstLinkRef} onClick={() => setMenuOpen(false)} className="text-lg">Home</Link>
              <Link href="/programs" onClick={() => setMenuOpen(false)} className="text-lg">Programs</Link>
              <Link href="/about" onClick={() => setMenuOpen(false)} className="text-lg">About</Link>
              <Link href="/resources" onClick={() => setMenuOpen(false)} className="text-lg">Resources</Link>
              <Link
                href="/donate"
                onClick={() => setMenuOpen(false)}
                className="mt-4 btn-crimson inline-flex items-center justify-center rounded-full px-4 py-2 text-white"
              >
                Donate
              </Link>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}

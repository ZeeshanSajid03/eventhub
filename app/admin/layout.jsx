"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const adminLinks = [
  { label: "Overview", href: "/admin" },
  { label: "Pending Events", href: "/admin/events/pending" },
  { label: "All Events", href: "/admin/events" },
  { label: "Broadcast Email", href: "/admin/broadcast" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeLink = adminLinks.find((l) => l.href === pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-red-600 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white font-bold text-lg">
            EventHub
          </Link>
          <span className="text-red-300">/</span>
          <span className="text-red-100 text-sm font-medium">
            Admin Panel
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-red-100 text-sm hidden sm:block">
            {user?.name}
          </span>
          <span className="bg-red-800 text-red-100 text-xs px-2 py-1 rounded-full">
            Admin
          </span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white text-sm border border-red-400 px-3 py-1.5 rounded-lg"
          >
            {activeLink?.label || "Menu"} ▾
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-2 space-y-1">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-red-50 text-red-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block w-56 shrink-0 py-6 pr-4">
          <nav className="space-y-1">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-red-50 text-red-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 py-6 px-4 lg:px-0 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
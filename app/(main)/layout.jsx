"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function MainLayout({ children }) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setShowTop(window.scrollY > 400);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main>{children}</main>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 w-10 h-10 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center z-50"
        >
          ↑
        </button>
      )}

      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="EventHub Logo"
                    width={28}
                    height={28}
                    className="rounded-lg"
                  />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">EventHub</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pakistan's premier event booking platform.</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800 mb-3 text-sm">
                Quick Links
              </p>
              <div className="space-y-2">
                <a href="/events" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 transition">Browse Events</a>
                <a href="/bookings" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 transition">My Bookings</a>
                <a href="/dashboard" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 transition">Dashboard</a>
              </div>
            </div>

            <div>
              <p className="font-semibold text-gray-800 mb-3 text-sm">
                For Organizers
              </p>
              <div className="space-y-2">
                <a href="/dashboard/events/create" className="block text-sm text-gray-500 hover:text-blue-600 transition">Create Event</a>
                <a href="/dashboard/events" className="block text-sm text-gray-500 hover:text-blue-600 transition">Manage Events</a>
                <a href="/dashboard/bookings" className="block text-sm text-gray-500 hover:text-blue-600 transition">View Bookings</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 text-center text-sm text-gray-400">
            © 2025 EventHub. Built with Next.js and MongoDB.
          </div>
        </div>
      </footer>
    </div>
  );
}
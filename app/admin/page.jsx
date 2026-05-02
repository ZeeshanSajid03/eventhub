"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      const events = data.events || [];

      setStats({
        total: events.length,
        pending: events.filter((e) => e.status === "pending").length,
        published: events.filter((e) => e.status === "published").length,
        rejected: events.filter((e) => e.status === "rejected").length,
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const cards = [
    { label: "Total Events", value: stats?.total, color: "blue" },
    { label: "Pending Review", value: stats?.pending, color: "yellow", href: "/admin/events/pending" },
    { label: "Published", value: stats?.published, color: "green" },
    { label: "Rejected", value: stats?.rejected, color: "red" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage all events and users on EventHub
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href || "/admin/events"}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition"
          >
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
            {card.label === "Pending Review" && card.value > 0 && (
              <p className="text-xs text-yellow-600 mt-1 font-medium">
                Needs attention
              </p>
            )}
          </Link>
        ))}
      </div>

      {stats?.pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-yellow-800">
              {stats.pending} event{stats.pending !== 1 ? "s" : ""} waiting for review
            </p>
            <p className="text-yellow-600 text-sm mt-0.5">
              Review and approve or reject submitted events
            </p>
          </div>
          <Link
            href="/admin/events/pending"
            className="text-sm font-medium text-yellow-700 hover:underline shrink-0 ml-4"
          >
            Review Now →
          </Link>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";

export function useEvents(filters = {}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [JSON.stringify(filters)]);

  async function fetchEvents() {
    try {
      setLoading(true);
      setError(null);

      // Build query string from filters
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.city) params.set("city", filters.city);
      if (filters.search) params.set("search", filters.search);
      if (filters.date) params.set("date", filters.date);

      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setEvents(data.events);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { events, loading, error, refetch: fetchEvents };
}
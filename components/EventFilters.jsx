"use client";

import { useState } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";

const CATEGORIES = [
  "all",
  "concert",
  "conference",
  "sports",
  "festival",
  "workshop",
  "other",
];

export default function EventFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    city: "",
    date: "",
  });

  function handleChange(e) {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
    onFilterChange(updated);
  }

  function handleCategory(cat) {
    const updated = { ...filters, category: cat };
    setFilters(updated);
    onFilterChange(updated);
  }

  function handleReset() {
    const reset = { search: "", category: "all", city: "", date: "" };
    setFilters(reset);
    onFilterChange(reset);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      {/* Search */}
      <Input
        name="search"
        value={filters.search}
        onChange={handleChange}
        placeholder="Search events..."
      />

      {/* Categories */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                filters.category === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* City */}
      <Input
        name="city"
        value={filters.city}
        onChange={handleChange}
        placeholder="Filter by city..."
      />

      {/* Date */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Date
        </label>
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleChange}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Reset */}
      <Button variant="outline" size="sm" fullWidth onClick={handleReset}>
        Reset Filters
      </Button>
    </div>
  );
}
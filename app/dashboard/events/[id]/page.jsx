"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";

const CATEGORIES = [
  "concert", "conference", "sports", "festival", "workshop", "other",
];

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetchEvent();
  }, [id]);

  async function fetchEvent() {
    try {
      const res = await fetch(`/api/events/${id}`);
      const data = await res.json();
      const e = data.event;
      setFormData({
        title: e.title,
        description: e.description,
        category: e.category,
        date: new Date(e.date).toISOString().slice(0, 16),
        endDate: e.endDate
          ? new Date(e.endDate).toISOString().slice(0, 16)
          : "",
        venue: e.venue,
        ticketTypes: e.ticketTypes.map((t) => ({
          name: t.name,
          price: t.price,
          totalSeats: t.totalSeats,
        })),
        tags: e.tags?.join(", ") || "",
        status: e.status,
        isFeatured: e.isFeatured,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleVenueChange(e) {
    setFormData((prev) => ({
      ...prev,
      venue: { ...prev.venue, [e.target.name]: e.target.value },
    }));
  }

  function handleTicketChange(index, field, value) {
    const updated = [...formData.ticketTypes];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, ticketTypes: updated }));
  }

  async function handleSave() {
    setSaving(true);
    setServerError("");
    try {
      const payload = {
        ...formData,
        ticketTypes: formData.ticketTypes.map((t) => ({
          name: t.name,
          price: Number(t.price),
          totalSeats: Number(t.totalSeats),
        })),
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };

      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      router.push("/dashboard/events");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-gray-500 text-sm mt-1">
          Update your event details
        </p>
      </div>

      {serverError && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {serverError}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Basic Information</h2>
        <Input
          label="Event Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <Input
          label="Tags (comma separated)"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Date & Venue</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <Input
          label="Venue Name"
          name="name"
          value={formData.venue.name}
          onChange={handleVenueChange}
        />
        <Input
          label="Address"
          name="address"
          value={formData.venue.address}
          onChange={handleVenueChange}
        />
        <Input
          label="City"
          name="city"
          value={formData.venue.city}
          onChange={handleVenueChange}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Ticket Types</h2>
        {formData.ticketTypes.map((ticket, index) => (
          <div
            key={index}
            className="p-4 border border-gray-100 rounded-xl bg-gray-50"
          >
            <p className="text-sm font-medium text-gray-700 mb-3">
              Ticket Type {index + 1}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Name</label>
                <input
                  value={ticket.name}
                  onChange={(e) => handleTicketChange(index, "name", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Price (Rs.)</label>
                <input
                  type="number"
                  value={ticket.price}
                  onChange={(e) => handleTicketChange(index, "price", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Total Seats</label>
                <input
                  type="number"
                  value={ticket.totalSeats}
                  onChange={(e) => handleTicketChange(index, "totalSeats", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pb-8">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
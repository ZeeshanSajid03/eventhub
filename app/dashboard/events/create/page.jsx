"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const CATEGORIES = [
  "concert", "conference", "sports", "festival", "workshop", "other",
];

const emptyTicketType = { name: "", price: "", totalSeats: "" };

export default function CreateEventPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "concert",
    date: "",
    endDate: "",
    venue: { name: "", address: "", city: "" },
    ticketTypes: [{ ...emptyTicketType }],
    tags: "",
    status: "draft",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

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

  function addTicketType() {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, { ...emptyTicketType }],
    }));
  }

  function removeTicketType(index) {
    if (formData.ticketTypes.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index),
    }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function validate() {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.venue.name) newErrors.venueName = "Venue name is required";
    if (!formData.venue.city) newErrors.venueCity = "City is required";
    if (!formData.venue.address)
      newErrors.venueAddress = "Address is required";
    formData.ticketTypes.forEach((t, i) => {
      if (!t.name) newErrors[`ticket_${i}_name`] = "Name required";
      if (t.price === "" || isNaN(t.price))
        newErrors[`ticket_${i}_price`] = "Valid price required";
      if (!t.totalSeats || isNaN(t.totalSeats))
        newErrors[`ticket_${i}_seats`] = "Valid seats required";
    });
    return newErrors;
  }

  async function handleSubmit(status) {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      let imageUrl = "";

      if (image) {
        const fd = new FormData();
        fd.append("file", image);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
        }
      }

      const payload = {
        ...formData,
        status: "pending",
        image: imageUrl,
        ticketTypes: formData.ticketTypes.map((t) => ({
          name: t.name,
          price: Number(t.price),
          totalSeats: Number(t.totalSeats),
        })),
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      router.push("/dashboard/events");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fill in the details to create a new event
        </p>
      </div>

      {serverError && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {serverError}
        </div>
      )}

      {/* Basic info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Basic Information</h2>

        <Input
          label="Event Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Lahore Music Festival 2025"
          error={errors.title}
          required
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe your event..."
            className={`px-4 py-2.5 border rounded-lg text-sm outline-none transition resize-none
              ${errors.description
                ? "border-red-400 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description}</p>
          )}
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
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 capitalize"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="capitalize">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Tags (comma separated)"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="music, outdoor, family"
        />
      </div>

      {/* Date & Venue */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Date & Venue</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Start Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`px-4 py-2.5 border rounded-lg text-sm outline-none transition
                ${errors.date
                  ? "border-red-400"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
            />
            {errors.date && (
              <p className="text-xs text-red-500">{errors.date}</p>
            )}
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
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <Input
          label="Venue Name"
          name="name"
          value={formData.venue.name}
          onChange={handleVenueChange}
          placeholder="e.g. Alhamra Arts Council"
          error={errors.venueName}
          required
        />
        <Input
          label="Address"
          name="address"
          value={formData.venue.address}
          onChange={handleVenueChange}
          placeholder="e.g. The Mall Road"
          error={errors.venueAddress}
          required
        />
        <Input
          label="City"
          name="city"
          value={formData.venue.city}
          onChange={handleVenueChange}
          placeholder="e.g. Lahore"
          error={errors.venueCity}
          required
        />
      </div>

      {/* Ticket Types */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Ticket Types</h2>
          <button
            onClick={addTicketType}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            + Add type
          </button>
        </div>

        {formData.ticketTypes.map((ticket, index) => (
          <div
            key={index}
            className="p-4 border border-gray-100 rounded-xl space-y-3 bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                Ticket Type {index + 1}
              </p>
              {formData.ticketTypes.length > 1 && (
                <button
                  onClick={() => removeTicketType(index)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Name
                </label>
                <input
                  value={ticket.name}
                  onChange={(e) =>
                    handleTicketChange(index, "name", e.target.value)
                  }
                  placeholder="e.g. General"
                  className={`px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                    ${errors[`ticket_${index}_name`] ? "border-red-400" : "border-gray-300"}`}
                />
                {errors[`ticket_${index}_name`] && (
                  <p className="text-xs text-red-500">
                    {errors[`ticket_${index}_name`]}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Price (Rs.)
                </label>
                <input
                  type="number"
                  min="0"
                  value={ticket.price}
                  onChange={(e) =>
                    handleTicketChange(index, "price", e.target.value)
                  }
                  placeholder="0"
                  className={`px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                    ${errors[`ticket_${index}_price`] ? "border-red-400" : "border-gray-300"}`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Total Seats
                </label>
                <input
                  type="number"
                  min="1"
                  value={ticket.totalSeats}
                  onChange={(e) =>
                    handleTicketChange(index, "totalSeats", e.target.value)
                  }
                  placeholder="100"
                  className={`px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                    ${errors[`ticket_${index}_seats`] ? "border-red-400" : "border-gray-300"}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image upload */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Event Image</h2>

        <div className="flex flex-col gap-3">
          {imagePreview && (
            <div className="w-full h-48 rounded-xl overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
            <span className="text-2xl mb-1">📷</span>
            <span className="text-sm text-gray-500">
              Click to upload image
            </span>
            <span className="text-xs text-gray-400">
              PNG, JPG up to 5MB
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-3 pb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
          Your event will be reviewed by our team before going live. This usually takes a few hours.
        </div>
        <Button onClick={() => handleSubmit()} loading={loading} fullWidth>
          Submit for Review
        </Button>
      </div>
    </div>
  );
}
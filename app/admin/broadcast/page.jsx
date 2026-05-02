"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function BroadcastPage() {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    targetRole: "all",
  });
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSend() {
    if (!formData.subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!formData.message.trim()) {
      toast.error("Message is required");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message);
      setFormData({ subject: "", message: "", targetRole: "all" });
      setPreview(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Broadcast Email
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Send an announcement email to all or specific users
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

        {/* Target audience */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Send To
          </label>
          <select
            name="targetRole"
            value={formData.targetRole}
            onChange={handleChange}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
          >
            <option value="all">All Users</option>
            <option value="user">Attendees Only</option>
            <option value="organizer">Organizers Only</option>
          </select>
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="e.g. Exciting new events this weekend!"
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
          />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={8}
            placeholder="Write your announcement here..."
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none"
          />
          <p className="text-xs text-gray-400 text-right">
            {formData.message.length} characters
          </p>
        </div>

        {/* Preview toggle */}
        <button
          onClick={() => setPreview(!preview)}
          className="text-sm text-red-600 hover:underline font-medium"
        >
          {preview ? "Hide Preview" : "Show Email Preview"}
        </button>

        {/* Preview */}
        {preview && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <p className="text-xs text-gray-500">
                Subject: <span className="font-medium text-gray-700">{formData.subject || "(no subject)"}</span>
              </p>
            </div>
            <div className="p-4 bg-white">
              <div
                style={{
                  fontFamily: "sans-serif",
                  maxWidth: "500px",
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                    padding: "24px",
                    borderRadius: "12px",
                    textAlign: "center",
                    marginBottom: "24px",
                  }}
                >
                  <h1 style={{ color: "white", margin: 0, fontSize: "22px" }}>
                    EventHub
                  </h1>
                </div>
                <p style={{ color: "#374151" }}>
                  Hi <strong>User Name</strong>,
                </p>
                <div
                  style={{
                    color: "#4b5563",
                    lineHeight: "1.6",
                    whiteSpace: "pre-line",
                  }}
                >
                  {formData.message || "(no message)"}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
          This email will be sent to all{" "}
          {formData.targetRole === "all"
            ? "registered users"
            : formData.targetRole === "user"
            ? "attendees"
            : "organizers"}{" "}
          on the platform. Make sure your message is correct before sending.
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() =>
              setFormData({ subject: "", message: "", targetRole: "all" })
            }
          >
            Clear
          </Button>
          <Button
            onClick={handleSend}
            loading={sending}
            className="bg-red-600 hover:bg-red-700"
          >
            Send Broadcast
          </Button>
        </div>
      </div>
    </div>
  );
}
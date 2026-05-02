"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import { User, Lock, Palette, Bell, AlertTriangle } from "lucide-react";

const TABS = [
  { id: "profile", label: "Profile", icon: <User size={16} /> },
  { id: "password", label: "Password", icon: <Lock size={16} /> },
  { id: "appearance", label: "Appearance", icon: <Palette size={16} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { id: "danger", label: "Danger Zone", icon: <AlertTriangle size={16} /> },
];

export default function SettingsPage() {
  const { user, fetchMe, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile state
  const [profileData, setProfileData] = useState({ name: "", email: "" });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState({
    bookingConfirmation: true,
    eventReminders: true,
    cancellations: true,
    newEvents: false,
    marketing: false,
  });

  // Appearance state
  const [theme, setTheme] = useState("light");

  // Danger zone
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || "", email: user.email || "" });
      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedNotifs = localStorage.getItem("notifications");
    setTheme(savedTheme);
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
  }, []);

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      let avatarUrl = user?.avatar || "";

      if (avatar) {
        const fd = new FormData();
        fd.append("file", avatar);
        const uploadRes = await fetch("/api/upload/avatar", {
          method: "POST",
          body: fd,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          avatarUrl = uploadData.url;
        }
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          avatar: avatarUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await fetchMe();
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSavePassword() {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingPassword(false);
    }
  }

  function handleSaveNotifications() {
    localStorage.setItem("notifications", JSON.stringify(notifications));
    toast.success("Notification preferences saved!");
  }

  function handleThemeChange(newTheme) {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast.success(`${newTheme === "dark" ? "Dark" : "Light"} mode enabled`);
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== user?.email) {
      toast.error("Email does not match");
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/user/profile", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      toast.success("Account deleted");
      logout();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <aside className="w-full lg:w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === tab.id
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Profile Information
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 font-bold text-2xl">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition">
                    <span className="text-white text-xs">✏️</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">
                    {user?.role}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                />
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">Account type:</span>{" "}
                    <span className="capitalize">{user?.role}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Account type cannot be changed after registration.
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveProfile} loading={savingProfile}>
                Save Changes
              </Button>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Change Password
              </h2>

              <div className="space-y-4">
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type={showPasswords ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                />
                <Input
                  label="New Password"
                  name="newPassword"
                  type={showPasswords ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                />
                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type={showPasswords ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showPasswords"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <label
                    htmlFor="showPasswords"
                    className="text-sm text-gray-600"
                  >
                    Show passwords
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 space-y-1">
                <p className="font-medium">Password requirements:</p>
                <p>Minimum 6 characters</p>
              </div>

              <Button onClick={handleSavePassword} loading={savingPassword}>
                Update Password
              </Button>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Appearance
              </h2>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Theme
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50 text-left"
                  >
                    <div className="w-full h-16 bg-white rounded-lg border border-gray-200 mb-3 flex flex-col gap-1 p-2">
                      <div className="h-2 bg-gray-200 rounded w-3/4" />
                      <div className="h-2 bg-gray-100 rounded w-1/2" />
                      <div className="h-2 bg-blue-200 rounded w-1/3" />
                    </div>
                    <p className="text-sm font-medium text-gray-800">Light Mode</p>
                    <p className="text-xs text-gray-400">Currently active</p>
                  </button>

                  <button
                    onClick={() => toast("Dark mode coming soon!", { icon: "🚧" })}
                    className="p-4 rounded-xl border-2 border-gray-200 text-left hover:border-gray-300 transition cursor-pointer"
                  >
                    <div className="w-full h-16 bg-gray-900 rounded-lg border border-gray-700 mb-3 flex flex-col gap-1 p-2">
                      <div className="h-2 bg-gray-600 rounded w-3/4" />
                      <div className="h-2 bg-gray-700 rounded w-1/2" />
                      <div className="h-2 bg-blue-600 rounded w-1/3" />
                    </div>
                    <p className="text-sm font-medium text-gray-800">Dark Mode</p>
                    <p className="text-xs text-gray-400">Coming soon</p>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Language</p>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 cursor-pointer">
                  <option value="en">English</option>
                  <option value="ur">Urdu</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Language support coming soon
                </p>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Notification Preferences
              </h2>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Email Notifications
                </p>

                {[
                  {
                    key: "bookingConfirmation",
                    label: "Booking Confirmations",
                    desc: "Get emailed when you successfully book a ticket",
                  },
                  {
                    key: "eventReminders",
                    label: "Event Reminders",
                    desc: "Reminders before your upcoming events",
                  },
                  {
                    key: "cancellations",
                    label: "Cancellation Updates",
                    desc: "Notifications when an event you booked is cancelled",
                  },
                  {
                    key: "newEvents",
                    label: "New Events",
                    desc: "Discover new events in your city",
                  },
                  {
                    key: "marketing",
                    label: "Promotional Emails",
                    desc: "Special offers and featured event announcements",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key],
                        }))
                      }
                      className={`relative w-11 h-6 rounded-full transition-colors ${notifications[item.key]
                        ? "bg-blue-600"
                        : "bg-gray-200"
                        }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[item.key]
                          ? "translate-x-5"
                          : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <Button onClick={handleSaveNotifications}>
                Save Preferences
              </Button>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === "danger" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Danger Zone
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  These actions are permanent and cannot be undone.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Export My Data
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Download all your bookings and account data
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast("Coming soon!", { icon: "🚧" })}
                    >
                      Export
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Delete Account
                      </p>
                      <p className="text-xs text-red-400 mt-0.5">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteModal(true)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setDeleteConfirm("");
        }}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            This will permanently delete your account, all your bookings, and
            all associated data. This cannot be undone.
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Type your email to confirm:{" "}
              <span className="font-bold">{user?.email}</span>
            </label>
            <input
              type="email"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={user?.email}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDeleteModal(false);
                setDeleteConfirm("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleting}
              onClick={handleDeleteAccount}
            >
              Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import EventCard from "@/components/EventCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { Search, Ticket, Smartphone, Tent } from "lucide-react";
import { Grid, Music, Briefcase, Trophy, PartyPopper, Wrench } from "lucide-react";

const CATEGORIES = [
    { label: "All", value: "", icon: <Grid size={15} /> },
    { label: "Concerts", value: "concert", icon: <Music size={15} /> },
    { label: "Conferences", value: "conference", icon: <Briefcase size={15} /> },
    { label: "Sports", value: "sports", icon: <Trophy size={15} /> },
    { label: "Festivals", value: "festival", icon: <PartyPopper size={15} /> },
    { label: "Workshops", value: "workshop", icon: <Wrench size={15} /> },
];

export default function HomePage() {
    const { isAuthenticated, isOrganizer } = useAuth();
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("");

    useEffect(() => {
        fetchEvents();
    }, [activeCategory]);

    async function fetchEvents() {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (activeCategory) params.set("category", activeCategory);

            const [featuredRes, upcomingRes] = await Promise.all([
                fetch("/api/events?featured=true"),
                fetch(`/api/events?${params.toString()}`),
            ]);

            const featuredData = await featuredRes.json();
            const upcomingData = await upcomingRes.json();

            setFeaturedEvents(featuredData.events?.slice(0, 3) || []);
            setUpcomingEvents(upcomingData.events?.slice(0, 6) || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            {/* Hero Section */}
            <section className="relative bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-300 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
                        {/* <span>🎪</span> */}
                        <span><Tent size={18} className="text-white" ></Tent></span>
                        <span>Pakistan's Premier Event Booking Platform</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
                        Discover & Book
                        <span className="block text-blue-200">Amazing Events</span>
                    </h1>
                    <p className="text-blue-100 text-lg max-w-xl mx-auto mb-8">
                        From concerts to conferences, find the best events happening
                        near you and book your tickets in seconds.
                    </p>

                    {/* Search bar */}
                    <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8">
                        <input
                            type="text"
                            placeholder="Search events, venues, cities..."
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    window.location.href = `/events?search=${e.target.value}`;
                                }
                            }}
                            className="flex-1 px-5 py-3 rounded-xl text-gray-800 text-sm outline-none shadow-lg bg-white"
                        />
                        <Link href="/events" className="sm:shrink-0">
                            <button className="w-full sm:w-auto px-6 py-3 bg-white text-blue-700 font-medium text-sm rounded-xl shadow-lg hover:bg-blue-50 transition">
                                Browse All
                            </button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap justify-center gap-8 text-center">
                        {[
                            { label: "Events Listed", value: "500+" },
                            { label: "Happy Attendees", value: "50K+" },
                            { label: "Cities Covered", value: "20+" },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-blue-200 text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Category Filter */}
            <section className="bg-white border-b border-gray-100 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setActiveCategory(cat.value)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.value
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {cat.icon}
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

                {/* Featured Events */}
                {featuredEvents.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Featured Events
                                </h2>
                                <p className="text-gray-500 text-sm mt-0.5">
                                    Handpicked events you don't want to miss
                                </p>
                            </div>
                            <Link
                                href="/events"
                                className="text-sm text-blue-600 hover:underline font-medium"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {featuredEvents.map((event) => (
                                <EventCard key={event._id} event={event} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Upcoming Events */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {activeCategory
                                    ? `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Events`
                                    : "Upcoming Events"}
                            </h2>
                            <p className="text-gray-500 text-sm mt-0.5">
                                Book your spot before they sell out
                            </p>
                        </div>
                        <Link
                            href="/events"
                            className="text-sm text-blue-600 hover:underline font-medium"
                        >
                            View all
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Spinner size="lg" />
                        </div>
                    ) : upcomingEvents.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-2xl">
                            <p className="text-4xl mb-3">🎪</p>
                            <p className="text-gray-500">No events found in this category</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {upcomingEvents.map((event) => (
                                <EventCard key={event._id} event={event} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Organizer CTA */}
                {!isOrganizer && (
                    <section className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
                        <h2 className="text-2xl font-bold mb-2">
                            Want to host an event?
                        </h2>
                        <p className="text-blue-100 mb-6 max-w-md mx-auto">
                            Create and manage your events on EventHub. Reach thousands of
                            attendees across Pakistan.
                        </p>
                        <Link
                            href={isAuthenticated ? "/dashboard" : "/register"}
                        >
                            <button className="px-6 py-3 bg-white text-blue-700 font-semibold text-sm rounded-xl hover:bg-blue-50 transition shadow-md">
                                {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                            </button>
                        </Link>
                    </section>
                )}

                {/* How it works */}
                <section className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        How it works
                    </h2>
                    <p className="text-gray-500 mb-8">
                        Book your tickets in 3 simple steps
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <Search size={28} className="text-blue-600" />,
                                bg: "bg-blue-50",
                                title: "Discover Events",
                                desc: "Browse hundreds of events happening near you",
                            },
                            {
                                icon: <Ticket size={28} className="text-indigo-600" />,
                                bg: "bg-indigo-50",
                                title: "Book Tickets",
                                desc: "Select your tickets and confirm your booking instantly",
                            },
                            {
                                icon: <Smartphone size={28} className="text-purple-600" />,
                                bg: "bg-purple-50",
                                title: "Show & Enjoy",
                                desc: "Show your QR ticket at the venue and enjoy the event",
                            },
                        ].map((step, i) => (
                            <div
                                key={i}
                                className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
                            >
                                <div className={`w-14 h-14 ${step.bg} rounded-2xl flex items-center justify-center mb-4 mx-auto`}>
                                    {step.icon}
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                                <p className="text-gray-500 text-sm">{step.desc}</p>
                            </div>
                        ))}

                    </div>
                </section>
            </div>
        </div>
    );
}
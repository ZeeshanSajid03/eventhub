# EventHub — Event Booking Platform

A full-stack event booking platform built with Next.js 15, MongoDB, and Tailwind CSS. EventHub allows users to discover events, book tickets, and manage their bookings, while giving organizers tools to create and manage events and giving admins full control over the platform.

## Live Demo

https://eventhubpk.vercel.app/

## Features

### For Users
- Browse and search upcoming events with category, city, and date filters
- Real-time seat availability with visual progress bars and countdown timers
- Complete ticket booking flow with order summary and confirmation
- QR code tickets viewable and printable from My Bookings
- Cancel bookings up to 24 hours before the event
- Email confirmation on every booking
- Waitlist system for sold-out events with automatic email notification when seats open
- Leave star ratings and reviews for events you have booked
- Full settings page with profile editing, avatar upload, password change, and notification preferences

### For Organizers
- Create and manage events with multiple ticket types, pricing, and seat limits
- Events go through admin review before going live
- Dashboard with analytics: total revenue, occupancy rate, daily bookings chart, revenue per event table
- View all bookings across your events
- Edit or cancel published events

### For Admins
- Review and approve or reject submitted events with optional rejection reason
- Mark any published event as featured from the admin panel
- Toggle featured status on any event at any time
- Broadcast email to all users, organizers, or attendees
- View all events across all statuses in one place

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | MongoDB + Mongoose |
| Styling | Tailwind CSS v4 |
| Authentication | JWT + HTTP-only cookies |
| Image Uploads | Cloudinary |
| Email | Nodemailer (Gmail) |
| Real-time | Socket.io |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | react-hot-toast |
| Deployment | Vercel + MongoDB Atlas |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Gmail account with App Password enabled

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/event-booking.git
cd event-booking
npm install
```

Create a `.env.local` file in the root:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Creating an Admin Account

1. Register a normal account on the platform
2. Open MongoDB Atlas and find your user document
3. Change the `role` field from `"user"` to `"admin"`
4. Log out and log back in
5. Access the admin panel at `/admin`

## Project Structure

```bash
event-booking/
├── app/
│   ├── (auth)/          # Login and register pages
│   ├── (main)/          # Public pages with Navbar
│   ├── admin/           # Admin panel
│   ├── dashboard/       # Organizer dashboard
│   └── api/             # All backend API routes
├── components/          # Reusable React components
├── context/             # Auth context
├── hooks/               # Custom hooks
├── lib/                 # DB connection, auth helpers
└── models/              # Mongoose models
```

## Key Technical Decisions

**Overbooking Prevention** — Booking uses MongoDB's `findOneAndUpdate` with an optimistic concurrency check on `bookedSeats`. If two users book simultaneously only one succeeds, the other gets a 409 conflict response.

**Edge Runtime Middleware** — Next.js middleware runs on the Edge Runtime which does not support Node.js modules. A separate lightweight JWT decoder using the Web Crypto API handles route protection in middleware while full JWT verification still happens in API routes.

**Pending-first Event Flow** — All new events save with `status: "pending"` regardless of organizer input. Only admin approval changes status to `"published"`, preventing spam and fake events.

## Deployment

The project is deployed on Vercel with MongoDB Atlas. Every push to the `main` branch triggers an automatic redeployment.

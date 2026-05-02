import mongoose from "mongoose";

const WaitlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    ticketType: { type: String, required: true },
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent duplicate waitlist entries for same user + event + ticket type
WaitlistSchema.index({ user: 1, event: 1, ticketType: 1 }, { unique: true });

export default mongoose.models.Waitlist || mongoose.model("Waitlist", WaitlistSchema);
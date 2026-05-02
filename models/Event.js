import mongoose from "mongoose";

const TicketTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },       // e.g. "General", "VIP"
  price: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  bookedSeats: { type: Number, default: 0 },
});

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["concert", "conference", "sports", "festival", "workshop", "other"],
      required: true,
    },
    date: { type: Date, required: true },
    endDate: { type: Date },
    venue: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
    },
    image: { type: String, default: "" },
    ticketTypes: [TicketTypeSchema],
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "draft", "published", "rejected", "cancelled", "completed"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
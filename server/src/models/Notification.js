import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: String,
    title: String,
    body: String,
    read: { type: Boolean, default: false },
    href: String,
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);

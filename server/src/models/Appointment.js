import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    token: String,
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    scheduledAt: { type: Date, required: true },
    reason: String,
    source: { type: String, enum: ["online", "walk-in"], default: "online" },
    status: {
      type: String,
      enum: ["scheduled", "checked-in", "cancelled", "converted", "no-show"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);

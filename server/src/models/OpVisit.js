import mongoose from "mongoose";

const opVisitSchema = new mongoose.Schema(
  {
    opNumber: { type: String, unique: true, required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    visitDate: { type: Date, default: Date.now },
    reason: String,
    queueStatus: {
      type: String,
      enum: ["waiting", "in-consultation", "completed"],
      default: "waiting",
    },
    visitStatus: {
      type: String,
      enum: ["open", "complete"],
      default: "open",
    },
    tokenNo: Number,
  },
  { timestamps: true }
);

export const OpVisit = mongoose.model("OpVisit", opVisitSchema);

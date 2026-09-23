import mongoose from "mongoose";

const labTestSchema = new mongoose.Schema(
  {
    visit: { type: mongoose.Schema.Types.ObjectId, ref: "OpVisit", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    testName: { type: String, required: true },
    status: {
      type: String,
      enum: ["requested", "collected", "processing", "completed"],
      default: "requested",
    },
    fee: { type: Number, default: 450 },
    collectedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

export const LabTest = mongoose.model("LabTest", labTestSchema);

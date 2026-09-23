import mongoose from "mongoose";

const ehrSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", unique: true, required: true },
    summary: String,
    vitalsLatest: {
      bp: String,
      hr: String,
      temp: String,
      spo2: String,
      weight: String,
    },
  },
  { timestamps: true }
);

export const EhrRecord = mongoose.model("EhrRecord", ehrSchema);

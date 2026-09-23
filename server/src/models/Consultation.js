import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
  {
    visit: { type: mongoose.Schema.Types.ObjectId, ref: "OpVisit", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symptoms: [String],
    notes: String,
    diagnosis: String,
    vitals: {
      bp: String,
      hr: String,
      temp: String,
      spo2: String,
    },
  },
  { timestamps: true }
);

export const Consultation = mongoose.model("Consultation", consultationSchema);

import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    visit: { type: mongoose.Schema.Types.ObjectId, ref: "OpVisit", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        medicine: String,
        dosage: String,
        duration: String,
        instructions: String,
      },
    ],
    dispensed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Prescription = mongoose.model("Prescription", prescriptionSchema);

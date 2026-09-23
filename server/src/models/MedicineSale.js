import mongoose from "mongoose";

const medicineSaleSchema = new mongoose.Schema(
  {
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription" },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    items: [
      {
        medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
        name: String,
        qty: Number,
        unitPrice: Number,
      },
    ],
    total: Number,
    dispensedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const MedicineSale = mongoose.model("MedicineSale", medicineSaleSchema);

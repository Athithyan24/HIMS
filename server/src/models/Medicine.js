import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    sku: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    generic: String,
    form: String,
    strength: String,
    stock: { type: Number, default: 0 },
    reorderAt: { type: Number, default: 20 },
    unitPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Medicine = mongoose.model("Medicine", medicineSchema);

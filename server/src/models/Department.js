import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    floor: String,
    opHours: String,
    head: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    consultFee: { type: Number, default: 600 },
  },
  { timestamps: true }
);

export const Department = mongoose.model("Department", departmentSchema);

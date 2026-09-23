import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    mrn: { type: String, unique: true, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    dob: Date,
    gender: { type: String, enum: ["female", "male", "other"] },
    bloodGroup: String,
    phone: String,
    email: String,
    address: String,
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
    allergies: [String],
    chronicIllnesses: [String],
    surgeries: [String],
    conditions: [String],
  },
  { timestamps: true }
);

export const Patient = mongoose.model("Patient", patientSchema);

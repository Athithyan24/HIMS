import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "doctor", "nurse", "pharmacy", "billing", "patient"],
      required: true,
    },
    phone: String,
    avatarSeed: String,
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    specialty: String,
    employeeCode: String,
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

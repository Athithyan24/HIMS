import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bill: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", required: true },
    amount: Number,
    method: { type: String, enum: ["cash", "upi", "card", "insurance"], default: "upi" },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);

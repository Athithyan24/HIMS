import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, unique: true, required: true },
    visit: { type: mongoose.Schema.Types.ObjectId, ref: "OpVisit" },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    lines: [
      {
        kind: { type: String, enum: ["consult", "lab", "medicine", "other"] },
        label: String,
        amount: Number,
      },
    ],
    subtotal: Number,
    tax: Number,
    total: Number,
    status: { type: String, enum: ["pending", "partial", "paid"], default: "pending" },
    paidAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Bill = mongoose.model("Bill", billSchema);

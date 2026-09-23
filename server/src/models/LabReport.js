import mongoose from "mongoose";

const labReportSchema = new mongoose.Schema(
  {
    labTest: { type: mongoose.Schema.Types.ObjectId, ref: "LabTest", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    findings: String,
    values: [{ label: String, value: String, range: String }],
    reviewedByDoctor: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const LabReport = mongoose.model("LabReport", labReportSchema);

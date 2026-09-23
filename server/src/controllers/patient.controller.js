import { Patient } from "../models/Patient.js";
import { EhrRecord } from "../models/EhrRecord.js";
import { User } from "../models/User.js";
import { Consultation } from "../models/Consultation.js";
import { Prescription } from "../models/Prescription.js";
import { LabReport } from "../models/LabReport.js";
import { LabTest } from "../models/LabTest.js";
import { Bill } from "../models/Bill.js";
import { OpVisit } from "../models/OpVisit.js";
import { nextId } from "../utils/ids.js";
import { asyncHandler, ApiError } from "../middlewares/error.js";
import bcrypt from "bcryptjs";
import { writeAudit } from "../services/activity.service.js";

export const registerWalkIn = asyncHandler(async (req, res) => {
  const { name, phone, email, gender, dob, bloodGroup, address, allergies, chronicIllnesses } = req.body;
  if (!name) throw new ApiError(400, "Name is required");
  const mrn = await nextId("patient", "PAT", 4);
  let user = null;
  if (email) {
    const passwordHash = await bcrypt.hash("Elara@2026", 10);
    user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "patient",
      phone,
      avatarSeed: name,
    });
  }
  const patient = await Patient.create({
    mrn,
    user: user?._id,
    name,
    phone,
    email,
    gender,
    dob,
    bloodGroup,
    address,
    allergies: allergies || [],
    chronicIllnesses: chronicIllnesses || [],
  });
  await EhrRecord.create({ patient: patient._id, summary: "Opened at reception." });
  await writeAudit(req.user._id, "patient.register", "Patient", patient._id.toString(), { mrn });
  res.status(201).json({ success: true, patient });
});

export const searchPatients = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();
  const filter = q
    ? {
        $or: [
          { name: new RegExp(q, "i") },
          { mrn: new RegExp(q, "i") },
          { phone: new RegExp(q, "i") },
        ],
      }
    : {};
  const patients = await Patient.find(filter).sort({ createdAt: -1 }).limit(40);
  res.json({ success: true, patients });
});

export const getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) throw new ApiError(404, "Patient not found");
  res.json({ success: true, patient });
});

export const getEhr = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) throw new ApiError(404, "Patient not found");
  if (req.user.role === "patient") {
    const mine = await Patient.findOne({ user: req.user._id });
    if (!mine || mine._id.toString() !== patient._id.toString()) {
      throw new ApiError(403, "You can only open your own record");
    }
  }
  const [ehr, visits, consults, rxs, labs, reports, bills] = await Promise.all([
    EhrRecord.findOne({ patient: patient._id }),
    OpVisit.find({ patient: patient._id }).populate("doctor department").sort({ createdAt: -1 }),
    Consultation.find({ patient: patient._id }).populate("doctor").sort({ createdAt: -1 }),
    Prescription.find({ patient: patient._id }).populate("doctor").sort({ createdAt: -1 }),
    LabTest.find({ patient: patient._id }).sort({ createdAt: -1 }),
    LabReport.find({ patient: patient._id }).populate("labTest").sort({ createdAt: -1 }),
    Bill.find({ patient: patient._id }).sort({ createdAt: -1 }),
  ]);
  res.json({ success: true, patient, ehr, visits, consults, rxs, labs, reports, bills });
});

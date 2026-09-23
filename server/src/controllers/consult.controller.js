import { Consultation } from "../models/Consultation.js";
import { Prescription } from "../models/Prescription.js";
import { LabTest } from "../models/LabTest.js";
import { OpVisit } from "../models/OpVisit.js";
import { EhrRecord } from "../models/EhrRecord.js";
import { asyncHandler, ApiError } from "../middlewares/error.js";
import { emitQueue } from "./op.controller.js";
import { notify } from "../services/activity.service.js";
import { renderPrescriptionPdf } from "../utils/pdf.js";

const LAB_FEES = {
  "Blood Test": 450,
  ECG: 700,
  "X-Ray": 850,
  "Thyroid Test": 650,
};

export const saveConsult = asyncHandler(async (req, res) => {
  const visit = await OpVisit.findById(req.params.visitId);
  if (!visit) throw new ApiError(404, "Visit not found");
  const consult = await Consultation.create({
    visit: visit._id,
    patient: visit.patient,
    doctor: req.user._id,
    symptoms: req.body.symptoms || [],
    notes: req.body.notes,
    diagnosis: req.body.diagnosis,
    vitals: req.body.vitals,
  });
  let rx = null;
  if (req.body.prescription?.length) {
    rx = await Prescription.create({
      visit: visit._id,
      patient: visit.patient,
      doctor: req.user._id,
      items: req.body.prescription,
    });
    await notify({
      role: "pharmacy",
      title: "New prescription",
      body: `Ready to dispense for OP ${visit.opNumber}`,
      href: "/pharmacy",
    });
  }
  const labs = [];
  for (const testName of req.body.labs || []) {
    labs.push(
      await LabTest.create({
        visit: visit._id,
        patient: visit.patient,
        doctor: req.user._id,
        testName,
        fee: LAB_FEES[testName] || 500,
      })
    );
  }
  if (labs.length) {
    await notify({
      role: "nurse",
      title: "Lab request",
      body: `${labs.length} test(s) for OP ${visit.opNumber}`,
      href: "/lab",
    });
  }
  await EhrRecord.findOneAndUpdate(
    { patient: visit.patient },
    { summary: req.body.diagnosis || "Consultation recorded", vitalsLatest: req.body.vitals }
  );
  await OpVisit.findByIdAndUpdate(visit._id, { queueStatus: "completed" });
  emitQueue(req);
  res.status(201).json({ success: true, consult, rx, labs });
});

export const getConsult = asyncHandler(async (req, res) => {
  const consult = await Consultation.findOne({ visit: req.params.visitId }).populate("doctor patient");
  const rx = await Prescription.findOne({ visit: req.params.visitId });
  const labs = await LabTest.find({ visit: req.params.visitId });
  res.json({ success: true, consult, rx, labs });
});

export const prescriptionPdf = asyncHandler(async (req, res) => {
  const rx = await Prescription.findById(req.params.id).populate("patient doctor");
  if (!rx) throw new ApiError(404, "Prescription not found");
  renderPrescriptionPdf(res, rx);
});

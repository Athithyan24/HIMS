import { LabTest } from "../models/LabTest.js";
import { LabReport } from "../models/LabReport.js";
import { asyncHandler, ApiError } from "../middlewares/error.js";
import { notify } from "../services/activity.service.js";

export const listLabs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.user.role === "doctor") filter.doctor = req.user._id;
  const labs = await LabTest.find(filter).populate("patient doctor visit").sort({ createdAt: -1 });
  res.json({ success: true, labs });
});

export const patchLab = asyncHandler(async (req, res) => {
  const update = { status: req.body.status };
  if (req.body.status === "collected") update.collectedAt = new Date();
  if (req.body.status === "completed") update.completedAt = new Date();
  const lab = await LabTest.findByIdAndUpdate(req.params.id, update, { new: true }).populate("patient doctor");
  res.json({ success: true, lab });
});

export const uploadReport = asyncHandler(async (req, res) => {
  const lab = await LabTest.findById(req.params.id);
  if (!lab) throw new ApiError(404, "Lab request not found");
  const report = await LabReport.create({
    labTest: lab._id,
    patient: lab.patient,
    findings: req.body.findings,
    values: req.body.values || [],
  });
  lab.status = "completed";
  lab.completedAt = new Date();
  await lab.save();
  await notify({
    user: lab.doctor,
    title: "Lab report ready",
    body: `${lab.testName} · review chart`,
    href: `/patients/${lab.patient}`,
  });
  res.status(201).json({ success: true, report });
});

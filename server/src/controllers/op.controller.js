import { OpVisit } from "../models/OpVisit.js";
import { Appointment } from "../models/Appointment.js";
import { nextId } from "../utils/ids.js";
import { asyncHandler, ApiError } from "../middlewares/error.js";

export function emitQueue(req) {
  const io = req.app.get("io");
  if (io) io.emit("queue:refresh");
}

export const createOp = asyncHandler(async (req, res) => {
  const { patient, department, doctor, reason, appointment } = req.body;
  if (!patient || !department || !doctor) throw new ApiError(400, "Patient, department and doctor are required");
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const tokenNo = (await OpVisit.countDocuments({ visitDate: { $gte: start }, doctor })) + 1;
  const opNumber = await nextId("op", "OP", 5);
  const visit = await OpVisit.create({
    opNumber,
    patient,
    department,
    doctor,
    reason,
    appointment,
    tokenNo,
  });
  if (appointment) await Appointment.findByIdAndUpdate(appointment, { status: "converted" });
  emitQueue(req);
  const populated = await OpVisit.findById(visit._id).populate("patient doctor department");
  res.status(201).json({ success: true, visit: populated });
});

export const queue = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const filter = { visitDate: { $gte: start } };
  if (req.user.role === "doctor") filter.doctor = req.user._id;
  if (req.query.doctor) filter.doctor = req.query.doctor;
  const visits = await OpVisit.find(filter).populate("patient doctor department").sort({ tokenNo: 1 });
  res.json({ success: true, visits });
});

export const setQueueStatus = asyncHandler(async (req, res) => {
  const visit = await OpVisit.findByIdAndUpdate(
    req.params.id,
    { queueStatus: req.body.queueStatus, visitStatus: req.body.visitStatus },
    { new: true }
  ).populate("patient doctor department");
  emitQueue(req);
  res.json({ success: true, visit });
});

export const opAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const day = new Date(now);
  day.setHours(0, 0, 0, 0);
  const week = new Date(day);
  week.setDate(week.getDate() - 6);
  const month = new Date(day);
  month.setDate(1);

  const [daily, weekly, monthly, byDept] = await Promise.all([
    OpVisit.countDocuments({ visitDate: { $gte: day } }),
    OpVisit.countDocuments({ visitDate: { $gte: week } }),
    OpVisit.countDocuments({ visitDate: { $gte: month } }),
    OpVisit.aggregate([
      { $match: { visitDate: { $gte: month } } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]),
  ]);

  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(day);
    d.setDate(d.getDate() - i);
    const n = new Date(d);
    n.setDate(n.getDate() + 1);
    const count = await OpVisit.countDocuments({ visitDate: { $gte: d, $lt: n } });
    trend.push({ date: d.toISOString().slice(5, 10), count });
  }

  res.json({ success: true, daily, weekly, monthly, byDept, trend });
});

export const visitHistory = asyncHandler(async (req, res) => {
  const visits = await OpVisit.find({ patient: req.params.patientId })
    .populate("doctor department")
    .sort({ createdAt: -1 });
  res.json({ success: true, visits });
});

export const getVisit = asyncHandler(async (req, res) => {
  const visit = await OpVisit.findById(req.params.id).populate("patient doctor department");
  if (!visit) throw new ApiError(404, "Visit not found");
  res.json({ success: true, visit });
});

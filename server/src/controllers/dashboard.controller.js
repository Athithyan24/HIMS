import { Patient } from "../models/Patient.js";
import { User } from "../models/User.js";
import { OpVisit } from "../models/OpVisit.js";
import { Bill } from "../models/Bill.js";
import { Appointment } from "../models/Appointment.js";
import { LabTest } from "../models/LabTest.js";
import { Medicine } from "../models/Medicine.js";
import { MedicineSale } from "../models/MedicineSale.js";
import { Consultation } from "../models/Consultation.js";
import { Prescription } from "../models/Prescription.js";
import { AuditLog } from "../models/AuditLog.js";
import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../middlewares/error.js";

export const adminKpis = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const [patients, doctors, dailyBills, activeOp, pendingBills, revenueAgg] = await Promise.all([
    Patient.countDocuments(),
    User.countDocuments({ role: "doctor" }),
    Bill.find({ createdAt: { $gte: start } }),
    OpVisit.countDocuments({ visitDate: { $gte: start }, visitStatus: "open" }),
    Bill.countDocuments({ status: { $ne: "paid" } }),
    Bill.aggregate([{ $match: { createdAt: { $gte: start } } }, { $group: { _id: null, t: { $sum: "$paidAmount" } } }]),
  ]);
  const dailyRevenue = dailyBills.reduce((a, b) => a + (b.paidAmount || 0), 0) || revenueAgg[0]?.t || 0;
  res.json({
    success: true,
    kpis: {
      patients,
      doctors,
      dailyRevenue,
      activeOp,
      pendingBills,
    },
  });
});

export const doctorKpis = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const [today, upcoming, pendingTests, done] = await Promise.all([
    OpVisit.countDocuments({ doctor: req.user._id, visitDate: { $gte: start } }),
    Appointment.countDocuments({ doctor: req.user._id, status: "scheduled", scheduledAt: { $gte: new Date() } }),
    LabTest.countDocuments({ doctor: req.user._id, status: { $ne: "completed" } }),
    Consultation.countDocuments({ doctor: req.user._id, createdAt: { $gte: start } }),
  ]);
  res.json({ success: true, kpis: { today, upcoming, pendingTests, done } });
});

export const nurseKpis = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const [waiting, registrations, labReq] = await Promise.all([
    OpVisit.countDocuments({ visitDate: { $gte: start }, queueStatus: "waiting" }),
    Patient.countDocuments({ createdAt: { $gte: start } }),
    LabTest.countDocuments({ status: { $in: ["requested", "collected"] } }),
  ]);
  res.json({ success: true, kpis: { waiting, registrations, labReq } });
});

export const pharmacyKpis = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const low = await Medicine.find({ $expr: { $lte: ["$stock", "$reorderAt"] } });
  const sales = await MedicineSale.aggregate([
    { $match: { createdAt: { $gte: start } } },
    { $group: { _id: null, t: { $sum: "$total" } } },
  ]);
  const pending = await Prescription.countDocuments({ dispensed: false });
  res.json({ success: true, kpis: { lowInventory: low.length, dailySales: sales[0]?.t || 0, pending } });
});

export const billingKpis = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const pending = await Bill.countDocuments({ status: { $ne: "paid" } });
  const paid = await Bill.aggregate([
    { $match: { createdAt: { $gte: start } } },
    { $group: { _id: null, t: { $sum: "$paidAmount" } } },
  ]);
  res.json({ success: true, kpis: { pending, revenue: paid[0]?.t || 0 } });
});

export const patientHome = asyncHandler(async (req, res) => {
  const p = await Patient.findOne({ user: req.user._id });
  if (!p) return res.json({ success: true, kpis: {} });
  const [appt, rx, report] = await Promise.all([
    Appointment.findOne({ patient: p._id, status: "scheduled", scheduledAt: { $gte: new Date() } })
      .populate("doctor department")
      .sort({ scheduledAt: 1 }),
    Prescription.findOne({ patient: p._id }).sort({ createdAt: -1 }).populate("doctor"),
    LabTest.findOne({ patient: p._id, status: "completed" }).sort({ completedAt: -1 }),
  ]);
  res.json({ success: true, patient: p, appointment: appt, prescription: rx, report });
});

export const activities = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find().populate("actor", "name role").sort({ createdAt: -1 }).limit(20);
  res.json({ success: true, logs });
});

export const notifications = asyncHandler(async (req, res) => {
  const notes = await Notification.find({
    $or: [{ user: req.user._id }, { role: req.user.role }],
  })
    .sort({ createdAt: -1 })
    .limit(30);
  res.json({ success: true, notifications: notes });
});

export const searchAll = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json({ success: true, patients: [], doctors: [] });
  const [patients, doctors] = await Promise.all([
    Patient.find({ $or: [{ name: new RegExp(q, "i") }, { mrn: new RegExp(q, "i") }] }).limit(8),
    User.find({ role: "doctor", name: new RegExp(q, "i") }).limit(6),
  ]);
  res.json({ success: true, patients, doctors });
});

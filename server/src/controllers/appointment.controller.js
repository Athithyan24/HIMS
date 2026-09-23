import { Appointment } from "../models/Appointment.js";
import { Patient } from "../models/Patient.js";
import { asyncHandler, ApiError } from "../middlewares/error.js";
import { notify } from "../services/activity.service.js";

export const createAppointment = asyncHandler(async (req, res) => {
  let patientId = req.body.patient;
  if (req.user.role === "patient") {
    const p = await Patient.findOne({ user: req.user._id });
    if (!p) throw new ApiError(400, "Patient profile missing");
    patientId = p._id;
  }
  if (!patientId) throw new ApiError(400, "Patient is required");
  const appt = await Appointment.create({
    patient: patientId,
    doctor: req.body.doctor,
    department: req.body.department,
    scheduledAt: req.body.scheduledAt,
    reason: req.body.reason,
    source: req.body.source || (req.user.role === "patient" ? "online" : "walk-in"),
    token: `A${Date.now().toString().slice(-6)}`,
  });
  await notify({
    user: req.body.doctor,
    title: "New appointment",
    body: req.body.reason || "Scheduled visit",
    href: "/appointments",
  });
  const populated = await Appointment.findById(appt._id).populate("patient doctor department");
  res.status(201).json({ success: true, appointment: populated });
});

export const listAppointments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "doctor") filter.doctor = req.user._id;
  if (req.user.role === "patient") {
    const p = await Patient.findOne({ user: req.user._id });
    filter.patient = p?._id;
  }
  if (req.query.date) {
    const start = new Date(req.query.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    filter.scheduledAt = { $gte: start, $lt: end };
  }
  const appointments = await Appointment.find(filter)
    .populate("patient doctor department")
    .sort({ scheduledAt: 1 });
  res.json({ success: true, appointments });
});

export const patchAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
    "patient doctor department"
  );
  res.json({ success: true, appointment });
});

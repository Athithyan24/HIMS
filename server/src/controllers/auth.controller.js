import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Patient } from "../models/Patient.js";
import { EhrRecord } from "../models/EhrRecord.js";
import { nextId } from "../utils/ids.js";
import { signToken } from "../middlewares/auth.js";
import { ApiError } from "../middlewares/error.js";
import { asyncHandler } from "../middlewares/error.js";
import { writeAudit } from "../services/activity.service.js";

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatarSeed: user.avatarSeed || user.name,
    department: user.department,
    specialty: user.specialty,
  };
}

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(401, "Email or password is incorrect");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Email or password is incorrect");
  if (user.status !== "active") throw new ApiError(403, "This account is disabled");
  res.json({ success: true, token: signToken(user), user: publicUser(user) });
});

export const registerPatient = asyncHandler(async (req, res) => {
  const { name, email, password, phone, gender, dob, bloodGroup } = req.body;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, "An account with this email already exists");
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "patient",
    phone,
    avatarSeed: name,
  });
  const mrn = await nextId("patient", "PAT", 4);
  const patient = await Patient.create({
    mrn,
    user: user._id,
    name,
    email: email.toLowerCase(),
    phone,
    gender,
    dob,
    bloodGroup,
  });
  await EhrRecord.create({ patient: patient._id, summary: "New patient. Chart opened at registration." });
  res.status(201).json({ success: true, token: signToken(user), user: publicUser(user), mrn });
});

export const me = asyncHandler(async (req, res) => {
  let patient = null;
  if (req.user.role === "patient") {
    patient = await Patient.findOne({ user: req.user._id });
  }
  res.json({ success: true, user: publicUser(req.user), patient });
});

export const createStaff = asyncHandler(async (req, res) => {
  if (req.body.role === "patient") throw new ApiError(400, "Patients self-register or are registered at reception");
  const exists = await User.findOne({ email: req.body.email.toLowerCase() });
  if (exists) throw new ApiError(409, "Email already in use");
  const passwordHash = await bcrypt.hash(req.body.password, 10);
  const user = await User.create({
    ...req.body,
    email: req.body.email.toLowerCase(),
    passwordHash,
    avatarSeed: req.body.name,
  });
  await writeAudit(req.user._id, "staff.create", "User", user._id.toString(), { role: user.role });
  res.status(201).json({ success: true, user: publicUser(user) });
});

export const listUsers = asyncHandler(async (req, res) => {
  const q = {};
  if (req.query.role) q.role = req.query.role;
  const users = await User.find(q).select("-passwordHash").populate("department").sort({ createdAt: -1 });
  res.json({ success: true, users });
});

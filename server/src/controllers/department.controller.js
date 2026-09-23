import { Department } from "../models/Department.js";
import { User } from "../models/User.js";
import { OpVisit } from "../models/OpVisit.js";
import { asyncHandler } from "../middlewares/error.js";

export const listDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().populate("head", "name specialty").lean();
  const withStats = await Promise.all(
    departments.map(async (d) => {
      const doctors = await User.countDocuments({ department: d._id, role: "doctor", status: "active" });
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const opCount = await OpVisit.countDocuments({ department: d._id, visitDate: { $gte: start } });
      return { ...d, doctors, opCount };
    })
  );
  res.json({ success: true, departments: withStats });
});

export const listDoctors = asyncHandler(async (req, res) => {
  const filter = { role: "doctor", status: "active" };
  if (req.query.department) filter.department = req.query.department;
  const doctors = await User.find(filter).select("-passwordHash").populate("department");
  res.json({ success: true, doctors });
});

export const upsertDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const dept = id
    ? await Department.findByIdAndUpdate(id, req.body, { new: true })
    : await Department.create(req.body);
  res.json({ success: true, department: dept });
});

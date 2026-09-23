import { User } from "../models/User.js";
import { Patient } from "../models/Patient.js";
import { OpVisit } from "../models/OpVisit.js";

export const userRepo = {
  findByEmail: (email) => User.findOne({ email }),
  findById: (id) => User.findById(id),
};

export const patientRepo = {
  findById: (id) => Patient.findById(id),
  findByUser: (userId) => Patient.findOne({ user: userId }),
};

export const visitRepo = {
  byDoctorToday: (doctor, start) => OpVisit.find({ doctor, visitDate: { $gte: start } }),
};

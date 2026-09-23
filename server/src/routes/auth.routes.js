import { Router } from "express";
import { login, registerPatient, me, createStaff, listUsers } from "../controllers/auth.controller.js";
import { loginRules, registerPatientRules, createStaffRules } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validate.js";
import { protect, allow } from "../middlewares/auth.js";

const r = Router();
r.post("/login", loginRules, validate, login);
r.post("/register", registerPatientRules, validate, registerPatient);
r.get("/me", protect, me);
r.get("/users", protect, allow("admin"), listUsers);
r.post("/staff", protect, allow("admin"), createStaffRules, validate, createStaff);
export default r;

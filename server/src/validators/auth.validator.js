import { body } from "express-validator";

export const loginRules = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password required"),
];

export const registerPatientRules = [
  body("name").trim().notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("phone").optional().isString(),
  body("gender").optional().isIn(["female", "male", "other"]),
];

export const createStaffRules = [
  body("name").trim().notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("role").isIn(["doctor", "nurse", "pharmacy", "billing"]),
];

import { validationResult } from "express-validator";
import { ApiError } from "./error.js";

export function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    throw new ApiError(422, "Please check the highlighted fields", result.array());
  }
  next();
}

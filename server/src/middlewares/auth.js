import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "./error.js";

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new ApiError(401, "Sign in to continue");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user || user.status !== "active") throw new ApiError(401, "Account is not active");
    req.user = user;
    next();
  } catch (err) {
    next(err.status ? err : new ApiError(401, "Session expired"));
  }
}

export function allow(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have access to this area"));
    }
    next();
  };
}

export function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "12h" });
}

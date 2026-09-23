export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function errorMiddleware(err, req, res, next) {
  const status = err.status || 500;
  const payload = {
    success: false,
    message: err.message || "Something went wrong",
  };
  if (err.details) payload.details = err.details;
  if (status >= 500) console.error(err);
  res.status(status).json(payload);
}

export function notFound(req, res) {
  res.status(404).json({ success: false, message: `No route for ${req.method} ${req.originalUrl}` });
}

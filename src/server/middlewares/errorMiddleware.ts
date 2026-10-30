import type { ApiRequest, ApiResponse } from "../types";

const globalErrorHandler = (err: any, _req: ApiRequest, res: ApiResponse) => {
  console.error("API error:", err?.stack || err?.message);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err?.message || "Internal Server Error";

  if (err?.name === "CastError") {
    statusCode = 404;
    message = `Resource not found. Invalid field: ${err.path}`;
  } else if (err?.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use another value.`;
  } else if (err?.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((e: any) => e.message).join(", ");
  } else if (statusCode >= 500 && process.env.NODE_ENV === "production") {
    message = "Internal Server Error"; // never show database / server internals to visitors
  }

  res.status(statusCode).json({ success: false, message });
};

export default globalErrorHandler;

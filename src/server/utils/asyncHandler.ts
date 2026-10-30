import type { ApiRequest, ApiResponse, NextFn } from "../types";

type AsyncHandler = (req: ApiRequest, res: ApiResponse, next: NextFn) => Promise<unknown>;

// Sends any error thrown inside a controller to the error handler instead of crashing the request.
const asyncHandler = (fn: AsyncHandler) => (req: ApiRequest, res: ApiResponse, next: NextFn) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;

import type { ApiResponse } from "../types";

export const fail = (res: ApiResponse, status: number, message: string) => res.status(status).json({ success: false, message });

/** Success reply: { success: true, message?, data? } */
export const ok = (res: ApiResponse, data?: unknown, message?: string, status = 200) =>
  res.status(status).json({ success: true, ...(message && { message }), ...(data !== undefined && { data }) });

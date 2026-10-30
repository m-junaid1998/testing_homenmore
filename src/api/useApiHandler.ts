import { toast } from "@/utils/toast";

export interface ApiHandlerOptions {
  successMessage?: string | ((data: any) => string);
  errorMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

const errorText = (err: any, fallback?: string) =>
  fallback || err?.data?.message || err?.message || (err?.status === "FETCH_ERROR" ? "Network error. Please check your connection." : "Something went wrong.");

/** Runs an API call and shows a toast: { success, data } on success, { success: false, error } on failure. */
export const useApiHandler = () => {
  const handleApiCall = async <T = any>(call: Promise<any>, opts: ApiHandlerOptions = {}): Promise<{ success: boolean; data?: T; error?: any }> => {
    try {
      const res = await call;
      if (res?.success === false) throw res;
      const message = typeof opts.successMessage === "function" ? opts.successMessage(res) : opts.successMessage ?? res?.message;
      if (message) toast.success(message);
      opts.onSuccess?.(res);
      return { success: true, data: res };
    } catch (err: any) {
      const message = errorText(err, opts.errorMessage);
      toast.error(typeof message === "string" ? message : JSON.stringify(message));
      opts.onError?.(err);
      return { success: false, error: message, data: err?.success === false ? err : undefined };
    }
  };

  return { handleApiCall };
};

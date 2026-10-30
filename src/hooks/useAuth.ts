"use client";

import { useCrudMutation, apiSlice } from "@/api/apiSlice";
import { endpoints } from "@/api/config";
import { useApiHandler, type ApiHandlerOptions } from "@/api/useApiHandler";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, logoutState } from "@/redux/authSlice";
import type { RootState } from "@/redux/store";

// Backend auth responses are flat:
// { success, message, _id, firstname, lastname, email, role, accessToken }  (the refresh token is an httpOnly cookie)
export const extractAuth = (res: any) => {
  if (!res?.accessToken || !res?._id) return null;
  return {
    user: {
      id: res._id,
      firstname: res.firstname,
      lastname: res.lastname,
      email: res.email,
      role: res.role,
    },
    accessToken: res.accessToken as string,
  };
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const [crudMutation, { isLoading: isAuthLoading }] = useCrudMutation();
  const { handleApiCall } = useApiHandler();

  const user = useSelector((state: RootState) => state.auth?.user);
  const token = useSelector((state: RootState) => state.auth?.token);
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated);
  const isAdmin = user?.role === "admin";

  const executeAuthRequest = (
    endpoint: string,
    method: "POST" | "PUT" | "DELETE",
    data?: any,
    options?: ApiHandlerOptions
  ) => handleApiCall(crudMutation({ endpoint, method, data }).unwrap(), options);

  const getWelcome = (res: any) => {
    const name = [res?.firstname, res?.lastname].filter(Boolean).join(" ");
    return name ? `Welcome ${name}` : "Welcome back!";
  };

  // After login/logout the guest cart/wishlist/orders must not leak into the new identity.
  const onSignedIn = (res: any, options?: ApiHandlerOptions) => {
    const auth = extractAuth(res);
    if (auth) {
      dispatch(setCredentials(auth));
      dispatch(apiSlice.util.resetApiState());
    }
    options?.onSuccess?.(res);
  };

  const loginUser = (payload: { email: string; password: string }, options?: ApiHandlerOptions) =>
    executeAuthRequest(endpoints.auth.login, "POST", payload, {
      errorMessage: "Login failed.",
      successMessage: getWelcome,
      ...options,
      onSuccess: (res) => onSignedIn(res, options),
    });

  const registerUser = (
    payload: { firstname: string; lastname: string; email: string; password: string },
    options?: ApiHandlerOptions
  ) =>
    executeAuthRequest(endpoints.auth.register, "POST", payload, {
      errorMessage: "Registration failed.",
      successMessage: getWelcome,
      ...options,
      onSuccess: (res) => onSignedIn(res, options),
    });

  // POST /auth/google { idToken } - needs GOOGLE_CLIENT_ID configured on the server
  const googleLogin = (idToken: string, options?: ApiHandlerOptions) =>
    executeAuthRequest(endpoints.auth.google, "POST", { idToken }, {
      errorMessage: "Google login failed.",
      successMessage: getWelcome,
      ...options,
      onSuccess: (res) => onSignedIn(res, options),
    });

  // PUT /auth/update-password (requires login)
  const updatePassword = (
    payload: { oldPassword: string; newPassword: string },
    options?: ApiHandlerOptions
  ) =>
    executeAuthRequest(endpoints.auth.changePassword, "PUT", payload, {
      successMessage: "Password updated successfully.",
      errorMessage: "Password update failed.",
      ...options,
    });

  const logoutUser = async (options?: ApiHandlerOptions) => {
    const finish = () => {
      dispatch(logoutState());
      dispatch(apiSlice.util.resetApiState());
    };
    const res = await executeAuthRequest(endpoints.auth.logout, "POST", undefined, {
      successMessage: options?.successMessage || "Logged out successfully.",
      errorMessage: "Logout failed.",
      ...options,
      onSuccess: (r) => {
        finish();
        options?.onSuccess?.(r);
      },
      onError: (e) => {
        finish();
        options?.onError?.(e);
      },
    });
    return res;
  };

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isAuthLoading,
    loginUser,
    registerUser,
    googleLogin,
    updatePassword,
    logoutUser,
  };
};

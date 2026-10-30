import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

// Saved in localStorage: only non-secret data. The access token lives in memory; the refresh token is an httpOnly cookie.
export interface PersistedAuth {
  user: User | null;
  guestId: string | null;
}

interface AuthState extends PersistedAuth {
  token: string | null; // access token, memory only, sent as Authorization: Bearer ...
  isAuthenticated: boolean;
  /** false on the server and until the browser's saved session has been read once */
  hydrated: boolean;
  /** true once we know whether this visitor has a login / guest id (or the guest request failed) */
  identitySettled: boolean;
}

export const AUTH_STORAGE_KEY = "bambotia:auth";

const initialState: AuthState = {
  user: null,
  token: null,
  guestId: null, // sent as `x-guest-id` for cart / wishlist / orders / reviews when logged out
  isAuthenticated: false,
  hydrated: false,
  identitySettled: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth: (state, action: PayloadAction<Partial<PersistedAuth> | null>) => {
      Object.assign(state, action.payload ?? {}, { hydrated: true });
    },
    identitySettled: (state) => {
      state.identitySettled = true;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.token = accessToken;
      state.isAuthenticated = true;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setGuestId: (state, action: PayloadAction<string>) => {
      state.guestId = action.payload;
    },
    // guestId is kept on purpose: a logged-out visitor continues with the same guest identity.
    logoutState: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { hydrateAuth, identitySettled, setCredentials, setToken, setGuestId, logoutState } = authSlice.actions;
export default authSlice.reducer;

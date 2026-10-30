import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";
import authReducer, { AUTH_STORAGE_KEY, type PersistedAuth } from "./authSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

/**
 * One store PER render tree (never a module-level singleton): on the server a singleton would be
 * shared between visitors. Only `auth` is saved to localStorage - persisting RTK Query's cache would
 * show one identity's cart / wishlist / orders to another after login or logout.
 */
export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // FormData / File objects are passed as mutation args
          ignoredActionPaths: ["meta.arg", "meta.baseQueryMeta"],
        },
      }).concat(apiSlice.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const readSavedAuth = (): Partial<PersistedAuth> | null => {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Saves the non-secret part of the auth slice (user, guest id) whenever it changes. */
export const persistAuth = (store: AppStore) => {
  let last = store.getState().auth;
  return store.subscribe(() => {
    const current = store.getState().auth;
    if (current === last) return;
    last = current;
    if (!current.hydrated) return;
    const saved: PersistedAuth = { user: current.user, guestId: current.guestId };
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(saved));
    } catch {
      /* storage full / blocked: the session just won't survive a reload */
    }
  });
};

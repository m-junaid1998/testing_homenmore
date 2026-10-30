import type { ApiRequest } from "../types";

// Cart, wishlist, orders and reviews belong to EITHER a logged-in user OR a guest (x-guest-id header).
// Only the field in use is set: a `null` in the other one would collide in the unique indexes.
export const getIdentityFilter = (req: ApiRequest) => (req.user ? { user: req.user.id } : { guestId: req.guestId });
export const getIdentityPayload = getIdentityFilter;

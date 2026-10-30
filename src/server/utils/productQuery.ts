import { escapeRegex } from "./safe";

export const CARD_SELECT = "-description -relatedProducts";
export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Name or description contains the text (a regex, so it is escaped first). */
export const searchFilter = (search: string) => {
  if (!search) return {};
  const regex = { $regex: escapeRegex(search), $options: "i" };
  return { $or: [{ name: regex }, { description: regex }] };
};

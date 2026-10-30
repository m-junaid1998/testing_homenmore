import Contact from "../models/Contact";
import { contactenum } from "../utils/enums";
import { getPaginatedData } from "../utils/paginationHelper";
import asyncHandler from "../utils/asyncHandler";
import { escapeRegex, isObjectId, text, toInt } from "../utils/safe";

const EMAIL = /^\S+@\S+\.\S+$/;
const statusName = (value: string) => (contactenum as Record<string, string>)[value] || value;

export const submitContactQuery = asyncHandler(async (req, res) => {
  const name = text(req.body.name, 100);
  const email = text(req.body.email, 120);
  const message = text(req.body.message, 3000);

  if (!name || !email || !message) return res.status(400).json({ success: false, message: "Please fill out all fields before submitting." });
  if (!EMAIL.test(email)) return res.status(400).json({ success: false, message: "Please provide a valid email" });

  await Contact.create({ name, email, message });
  return res.status(201).json({ success: true, message: "Your message has been received successfully." });
});

export const getDashboardQueries = asyncHandler(async (req, res) => {
  const search = text(req.query.search);
  const status = text(req.query.status, 30);
  const dateRange = text(req.query.dateRange, 30).toLowerCase();
  const queryObj: Record<string, any> = {};

  if (search) {
    const regex = { $regex: escapeRegex(search), $options: "i" };
    queryObj.$or = [{ name: regex }, { email: regex }, { message: regex }];
  }
  if (status && status.toLowerCase() !== "all") {
    queryObj.status = { $regex: `^${escapeRegex(statusName(status))}$`, $options: "i" };
  }

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  if (dateRange === "7days") since.setDate(since.getDate() - 7);
  else if (dateRange === "30days") since.setDate(since.getDate() - 30);
  if (["today", "7days", "30days"].includes(dateRange)) queryObj.createdAt = { $gte: since };

  const count = (key?: number) => Contact.countDocuments(key ? { ...queryObj, status: contactenum[key as keyof typeof contactenum] } : queryObj);
  const [totalMessages, pendingMessages, inProgressMessages, resolvedMessages, paginated] = await Promise.all([
    count(), count(1), count(2), count(3),
    getPaginatedData(Contact, queryObj, {
      page: toInt(req.query.page, 1),
      limit: toInt(req.query.limit, 10, 1, 100),
      sortOn: req.query.sortOn,
      sortDirection: req.query.sortDirection,
      searchString: search,
      isAllRecord: true,
    }),
  ]);

  return res.status(200).json({
    success: true,
    stats: { totalMessages, pendingMessages, inProgressMessages, resolvedMessages },
    pagination: paginated.pagination,
    data: paginated.data,
  });
});

export const updateQueryStatus = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid id." });
  const query = await Contact.findById(req.params.id);
  if (!query) return res.status(404).json({ success: false, message: "Contact query record not found." });

  if (req.body.status !== undefined) {
    const status = statusName(text(req.body.status, 30));
    if (!Object.values(contactenum).includes(status)) return res.status(400).json({ success: false, message: "Invalid status value." });
    query.status = status;
  }
  if (req.body.adminNotes !== undefined) query.adminNotes = text(req.body.adminNotes, 2000);

  return res.status(200).json({ success: true, message: "Query status updated successfully.", data: await query.save() });
});

export const deleteQuery = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid id." });
  const query = await Contact.findById(req.params.id);
  if (!query) return res.status(404).json({ success: false, message: "Contact query record not found." });

  await query.deleteOne();
  return res.status(200).json({ success: true, message: "Query removed from system successfully." });
});

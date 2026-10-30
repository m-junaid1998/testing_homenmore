import crypto from "crypto";
import Order from "../models/Order";
import Product from "../models/Product";
import { orderenum } from "../utils/enums";
import { getPaginatedData } from "../utils/paginationHelper";
import asyncHandler from "../utils/asyncHandler";
import { getIdentityFilter, getIdentityPayload } from "../utils/identityHelper";
import { sendOrderNotificationEmail } from "../utils/emailService";
import { invalidate, NS } from "../utils/cache";
import { resolveUnitPricing } from "../utils/sizes";
import { escapeRegex, isObjectId, text, toInt } from "../utils/safe";
import { PAYMENT_METHODS, orderTotals, type PaymentMethod } from "../../utils/shipping";
import { loadShippingRules } from "../utils/shippingRules";
import { fail } from "../utils/respond";

const MAX_ITEMS = 30;
const MAX_QTY_PER_ITEM = 50;

/** Takes only the known address fields from the request, with length limits. */
const readCustomerInfo = (raw: any) => {
  const info = {
    fullName: text(raw?.fullName, 100),
    phone: text(raw?.phone, 20),
    country: text(raw?.country, 60),
    city: text(raw?.city, 60),
    postalCode: text(raw?.postalCode, 20),
    areaTown: text(raw?.areaTown, 100),
    address: text(raw?.address, 300),
    orderNotes: text(raw?.orderNotes, 500),
  };
  const missing = (["fullName", "phone", "country", "city", "areaTown", "address"] as const).filter((k) => !info[k]);
  if (missing.length) return { error: `Please fill in: ${missing.join(", ")}` };
  if (!/^[0-9+\-\s()]{7,20}$/.test(info.phone)) return { error: "Please enter a valid phone number" };
  return { info };
};

export const addOrderItems = asyncHandler(async (req, res) => {
  const paymentMethod: PaymentMethod = req.body.paymentMethod ?? "Cash on Delivery";
  if (!PAYMENT_METHODS.includes(paymentMethod)) return fail(res, 400, "Invalid payment method");

  const { info: customerInfo, error } = readCustomerInfo(req.body.customerInfo);
  if (!customerInfo) return fail(res, 400, error!);

  const requested = req.body.orderItems;
  if (!Array.isArray(requested) || requested.length === 0 || requested.length > MAX_ITEMS) {
    return fail(res, 400, "No order items found");
  }

  // Everything that costs money comes from the database: name, image, price, stock. The browser only says WHAT and HOW MANY.
  const productIds = requested.map((item: any) => item?.product);
  if (!productIds.every(isObjectId)) return fail(res, 400, "Invalid product in order");
  const products = await Product.find({ _id: { $in: productIds }, isPublished: true }).lean();
  const byId = new Map(products.map((p: any) => [String(p._id), p]));

  const orderItems = [];
  for (const item of requested) {
    const product: any = byId.get(String(item.product));
    const qty = Number(item.qty);
    if (!product) return fail(res, 400, "A product in your cart is no longer available");
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) return fail(res, 400, "Invalid quantity");

    const pricing = resolveUnitPricing(product, text(item.size, 40));
    if (!pricing.ok) return fail(res, 400, pricing.message!);

    const color = text(item.color ?? item.colors, 40);
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] ?? "",
      qty,
      price: pricing.price,
      size: pricing.size,
      color: product.colors?.includes(color) ? color : product.colors?.[0] || "",
    });
  }

  // Delivery charge, free-delivery threshold and online discount are applied here, never taken from the browser.
  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totals = orderTotals(subtotal, paymentMethod, await loadShippingRules());

  // Take the stock first. Each update only succeeds while enough stock is left, so two shoppers can never buy the last piece.
  const reserved: typeof orderItems = [];
  for (const item of orderItems) {
    const { modifiedCount } = await Product.updateOne({ _id: item.product, stock: { $gte: item.qty } }, { $inc: { stock: -item.qty } });
    if (!modifiedCount) {
      for (const done of reserved) await Product.updateOne({ _id: done.product }, { $inc: { stock: done.qty } });
      return fail(res, 400, `Sorry, "${item.name}" does not have enough stock.`);
    }
    reserved.push(item);
  }

  let order;
  try {
    order = await Order.create({
      ...getIdentityPayload(req),
      orderNumber: `BMT-${crypto.randomInt(10_000_000, 100_000_000)}`,
      customerInfo,
      orderItems,
      paymentMethod,
      ...totals,
      status: orderenum[1],
    });
  } catch (err) {
    for (const done of reserved) await Product.updateOne({ _id: done.product }, { $inc: { stock: done.qty } });
    throw err;
  }

  await invalidate(NS.products); // stock is part of the product payload
  sendOrderNotificationEmail(order);

  return res.status(201).json({ success: true, data: order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find(getIdentityFilter(req)).sort({ createdAt: -1 }).limit(100).lean();
  return res.status(200).json({ success: true, count: orders.length, data: orders });
});

// An order contains a name, phone and address: only its owner (or an admin) may read it.
export const getOrderById = asyncHandler(async (req, res) => {
  const id = text(req.params.id, 40);
  const isAdmin = req.user?.role === "admin";

  const order = await Order.findOne({
    ...(isObjectId(id) ? { _id: id } : { orderNumber: id }),
    ...(isAdmin ? {} : getIdentityFilter(req)),
  });
  if (!order) return fail(res, 404, "Order not found");

  return res.status(200).json({ success: true, data: order });
});

export const getDashboardOrders = asyncHandler(async (req, res) => {
  const { sortOn, sortDirection } = req.query;
  const search = text(req.query.search);
  const status = text(req.query.status, 30);
  const dateRange = text(req.query.dateRange, 30).toLowerCase();

  const queryObj: Record<string, any> = {};

  if (search) {
    const regex = { $regex: escapeRegex(search), $options: "i" };
    queryObj.$or = [{ orderNumber: regex }, { "customerInfo.fullName": regex }, { "customerInfo.phone": regex }, { "customerInfo.city": regex }];
  }

  if (status && status.toLowerCase() !== "all") {
    const wanted = (orderenum as Record<string, string>)[status] || status;
    queryObj.status = { $regex: `^${escapeRegex(wanted)}$`, $options: "i" };
  }

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  if (dateRange === "7days" || dateRange === "last 7 days") since.setDate(since.getDate() - 7);
  else if (dateRange === "30days" || dateRange === "last 30 days") since.setDate(since.getDate() - 30);
  if (["today", "last 24 hours", "7days", "last 7 days", "30days", "last 30 days"].includes(dateRange)) {
    queryObj.createdAt = { $gte: since };
  }

  const countStatus = (key?: number) => Order.countDocuments(key ? { ...queryObj, status: orderenum[key as keyof typeof orderenum] } : queryObj);

  const [totalOrders, pendingOrders, confirmedOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrders, revenue] = await Promise.all([
    countStatus(), countStatus(1), countStatus(2), countStatus(3), countStatus(4), countStatus(5), countStatus(6),
    Order.aggregate([{ $match: { ...queryObj, status: orderenum[5] } }, { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } }]),
  ]);

  const paginated = await getPaginatedData(Order, queryObj, {
    page: toInt(req.query.currentPage, 1),
    limit: toInt(req.query.pageSize, 10, 1, 100),
    sortOn,
    sortDirection,
    searchString: search,
    isAllRecord: req.query.isAllRecord === "true",
  });

  return res.status(200).json({
    success: true,
    stats: { totalOrders, pendingOrders, confirmedOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrders, totalRevenue: revenue[0]?.totalSales ?? 0 },
    pagination: paginated.pagination,
    data: paginated.data,
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return fail(res, 404, "Order not found");

  const requested = text(req.body.status, 30);
  const status = (orderenum as Record<string, string>)[requested] || requested;
  if (!Object.values(orderenum).includes(status)) return fail(res, 400, "Invalid order status");

  order.status = status;
  if (status === orderenum[5]) {
    order.isPaid = true;
    order.paidAt = new Date();
    order.deliveredAt = new Date();
  }
  const updated = await order.save();

  return res.status(200).json({ success: true, message: `Order status updated to ${status} successfully`, data: updated });
});

export const deleteAllOrders = asyncHandler(async (_req, res) => {
  const result = await Order.deleteMany({});
  return res.status(200).json({ success: true, message: "All orders deleted successfully", deletedCount: result.deletedCount });
});

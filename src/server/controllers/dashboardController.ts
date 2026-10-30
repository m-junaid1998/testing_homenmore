import Order from "../models/Order";
import Product from "../models/Product";
import { orderenum } from "../utils/enums";
import asyncHandler from "../utils/asyncHandler";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const delivered = { status: orderenum[5] };

// Admin home: totals, revenue per month, sales per category and the five best sellers (delivered orders count as sales).
export const getDashboardOverview = asyncHandler(async (_req, res) => {
  const year = new Date().getFullYear();

  const [revenue, orders, productsLive, monthly, byCategory, topProducts] = await Promise.all([
    Order.aggregate([{ $match: delivered }, { $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
    Order.aggregate([
      { $match: { status: { $ne: orderenum[6] } } },
      { $group: { _id: null, count: { $sum: 1 }, customers: { $addToSet: "$customerInfo.phone" } } },
    ]),
    Product.countDocuments({ isPublished: true }),
    Order.aggregate([
      { $match: { ...delivered, createdAt: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } },
      { $group: { _id: { $month: "$createdAt" }, revenue: { $sum: "$totalPrice" } } },
    ]),
    Order.aggregate([
      { $match: delivered },
      { $unwind: "$orderItems" },
      { $lookup: { from: "products", localField: "orderItems.product", foreignField: "_id", as: "product" } },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "categories", localField: "product.categoryname", foreignField: "_id", as: "category" } },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $group: { _id: { $ifNull: ["$category.categoryname", "Uncategorized"] }, sales: { $sum: "$orderItems.qty" } } },
      { $sort: { sales: -1 } },
    ]),
    Order.aggregate([
      { $match: delivered },
      { $unwind: "$orderItems" },
      { $group: { _id: "$orderItems.product", name: { $first: "$orderItems.name" }, unitsSold: { $sum: "$orderItems.qty" }, totalEarnings: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } } } },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const totalRevenue = revenue[0]?.total ?? 0;
  const totalOrders = orders[0]?.count ?? 0;

  return res.status(200).json({
    success: true,
    topCards: {
      totalRevenue,
      totalOrders,
      totalCustomers: orders[0]?.customers.length ?? 0,
      avgOrderValue: totalOrders ? Math.round(totalRevenue / totalOrders) : 0,
      productsLive,
    },
    charts: {
      salesOverTime: MONTHS.map((month, i) => ({ month, revenue: monthly.find((m) => m._id === i + 1)?.revenue ?? 0 })),
      salesByCategory: byCategory.map((c) => ({ category: c._id, sales: c.sales })),
    },
    bestSellers: topProducts.map((p, i) => ({ rank: i + 1, name: p.name, unitsSold: p.unitsSold, totalEarnings: p.totalEarnings })),
  });
});

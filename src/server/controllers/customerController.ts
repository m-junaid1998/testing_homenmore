import Order from "../models/Order";
import asyncHandler from "../utils/asyncHandler";
import { escapeRegex, text, toInt } from "../utils/safe";

const getDashboardCustomers = asyncHandler(async (req, res) => {
        const page = toInt(req.query.currentPage, 1);
        const limit = toInt(req.query.pageSize, 10, 1, 100);
        const skip = (page - 1) * limit;
        const searchString = text(req.query.searchString);

        const matchStage: Record<string, any> = {};
        if (searchString) {
            const regex = { $regex: escapeRegex(searchString), $options: "i" };
            matchStage.$or = [{ "customerInfo.fullName": regex }, { "customerInfo.phone": regex }, { "customerInfo.city": regex }];
        }

        const aggregationPipeline: any[] = [
            { $match: { status: { $ne: "Cancelled" } } },
            
            ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),

            {
                $group: {
                    _id: "$customerInfo.phone", 
                    fullName: { $first: "$customerInfo.fullName" },
                    phone: { $first: "$customerInfo.phone" },
                    city: { $first: "$customerInfo.city" },
                    ordersCount: { $sum: 1 }, 
                    totalSpent: { $sum: "$totalPrice" }, 
                    lastOrderedAt: { $max: "$createdAt" }
                }
            },

            { $sort: { lastOrderedAt: -1 } }
        ];

        const totalUniqueRecords = await Order.aggregate([
            ...aggregationPipeline,
            { $count: "count" }
        ]);
        const totalCount = totalUniqueRecords.length > 0 ? totalUniqueRecords[0].count : 0;
        const totalPages = Math.ceil(totalCount / limit);

        aggregationPipeline.push({ $skip: skip });
        aggregationPipeline.push({ $limit: limit });

        const customersList = await Order.aggregate(aggregationPipeline);

        const repeatBuyersAggregate = await Order.aggregate([
            { $match: { status: { $ne: "Cancelled" } } },
            { $group: { _id: "$customerInfo.phone", count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } },
            { $count: "repeatCount" }
        ]);
        const repeatBuyersCount = repeatBuyersAggregate.length > 0 ? repeatBuyersAggregate[0].repeatCount : 0;

        res.status(200).json({
            success: true,
            stats: {
                totalCustomers: totalCount,
                repeatBuyers: repeatBuyersCount
            },
            pagination: {
                totalCount,
                totalPages,
                currentPage: page,
                pageSize: limit
            },
            data: customersList.map(item => ({
                fullName: item.fullName,
                phone: item.phone,
                city: item.city,
                orders: item.ordersCount,
                totalSpent: item.totalSpent
            }))
        });
});

export { getDashboardCustomers };
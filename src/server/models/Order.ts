import mongoose from "mongoose";
import { orderenum } from "../utils/enums";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    guestId: {
      type: String,
      required: false,
      default: null,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerInfo: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      country: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String },
      areaTown: { type: String, required: true },
      address: { type: String, required: true },
      orderNotes: { type: String },
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        color: {
          type: String,
          default: "",
        },
        // Chosen size label ("" when the product has no sizes). `price` above is that size's sale price.
        size: {
          type: String,
          default: "",
        },
      },
    ],
    paymentMethod: {
      type: String,
      required: true,
      default: "Cash on Delivery",
    },
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    discountPrice: { type: Number, required: true, default: 0 }, // online-payment discount
    totalPrice: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      required: true,
      enum: Object.values(orderenum),
      default: orderenum[1],
    },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Customer order lists (partial: guest orders do not fill the user index and vice versa) and the admin list.
orderSchema.index({ user: 1, createdAt: -1 }, { partialFilterExpression: { user: { $type: "objectId" } } });
orderSchema.index({ guestId: 1, createdAt: -1 }, { partialFilterExpression: { guestId: { $type: "string" } } });
orderSchema.index({ status: 1, createdAt: -1 });

export default (mongoose.models.Order as mongoose.Model<any>) || mongoose.model("Order", orderSchema);
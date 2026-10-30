import mongoose from "mongoose";

// One document per group of settings (key = "shipping"). Only shipping exists today.
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    deliveryCharge: { type: Number, min: 0, max: 100000 },
    freeShippingAbove: { type: Number, min: 0, max: 100000000 },
  },
  { timestamps: true }
);

export default (mongoose.models.Setting as mongoose.Model<any>) || mongoose.model("Setting", settingSchema);

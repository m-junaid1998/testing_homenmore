import mongoose from "mongoose";
import { contactenum } from "../utils/enums";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    message: {
      type: String,
      required: [true, "Message content cannot be empty"],
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(contactenum),
      default: contactenum[1],
    },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true },
);

export default (mongoose.models.Contact as mongoose.Model<any>) || mongoose.model("Contact", contactSchema);

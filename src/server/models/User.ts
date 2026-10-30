import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: [true, "First name is required"], trim: true, maxlength: 50 },
    lastname: { type: String, default: "", trim: true, maxlength: 50 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: { type: String, required: [true, "Password is required"] },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    refreshToken: { type: String, default: null, select: false }, // SHA-256 hash of the current refresh token
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = function (enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default (mongoose.models.User as mongoose.Model<any>) || mongoose.model("User", userSchema);

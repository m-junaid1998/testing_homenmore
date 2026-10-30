import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            sparse: true,
            unique: true,
        },
        guestId: {
            type: String,
            sparse: true,
            unique: true,
        },
        cartItems: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                qty: {
                    type: Number,
                    required: true,
                    default: 1,
                },
                size: {
                    type: String,
                    default: "",
                    trim: true,
                },
                color: {
                    type: String,
                    default: "",
                    trim: true,
                },
            },
        ],
    },

    { timestamps: true }
);

cartSchema.pre("validate", function () {
    if (!this.user && !this.guestId) {
        throw new Error("Cart must belong to either a user or a guestId");
    }
});

export default (mongoose.models.Cart as mongoose.Model<any>) || mongoose.model("Cart", cartSchema);
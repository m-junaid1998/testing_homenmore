import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
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
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
    },
    // autoIndex disabled on purpose - see the comment in Cart.js.
    { timestamps: true }
);

// Every wishlist must belong to either a logged-in user or a guest.
// Sync-style hook (no `next` param) - throwing fails validation. This works
// across Mongoose versions, unlike the older `function(next) {...}` callback
// style whose exact invocation signature has changed between major versions.
wishlistSchema.pre("validate", function () {
    if (!this.user && !this.guestId) {
        throw new Error("Wishlist must belong to either a user or a guestId");
    }
});

export default (mongoose.models.Wishlist as mongoose.Model<any>) || mongoose.model("Wishlist", wishlistSchema);

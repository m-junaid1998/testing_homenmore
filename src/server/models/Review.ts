import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        guestId: {
            type: String,
        },
        name: {
            type: String,
            required: true, 
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5, 
        },
        title: {
            type: String, 
            trim: true,
        },
        comment: {
            type: String,
            required: true, 
        },
        photos: {
            type: [String], 
            validate: [arrayLimit, "{PATH} exceeds the limit of 4 photos"], 
        },
    },

    // migration-race concern applies here since this schema used to have a
    // required `user` field with a plain {product,user} unique index.
    { timestamps: true }
);

function arrayLimit(val: string[]) {
    return val.length <= 4;
}

// Every review must belong to either a logged-in user or a guest.

reviewSchema.pre("validate", function () {
    if (!this.user && !this.guestId) {
        throw new Error("Review must belong to either a user or a guestId");
    }
});

// One review per product per identity. A single compound unique index on
// {product, user} can't be reused for guests (it would require `user` on
// every document), so this uses two PARTIAL unique indexes instead - each
// only applies to documents that actually have that field, which is exactly
// what's needed for two mutually-exclusive identity types on the same
// collection. (A plain `sparse` index doesn't work here: for a *compound*
// sparse index, MongoDB only skips a document if ALL of its keys are
// missing, not just one - so a guest review, which always has `product`,
// would still get indexed and collide with other guests' reviews.)
reviewSchema.index(
    { product: 1, user: 1 },
    { unique: true, partialFilterExpression: { user: { $exists: true } } }
);
reviewSchema.index(
    { product: 1, guestId: 1 },
    { unique: true, partialFilterExpression: { guestId: { $exists: true } } }
);

export default (mongoose.models.Review as mongoose.Model<any>) || mongoose.model("Review", reviewSchema);
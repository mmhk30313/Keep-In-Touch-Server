const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
    {
        user_email: {
            type: Number,
            required: true,
            unique: true,
        },
        title: {
            type: String,
            length: 20,
            required: true,
        },
        description: {
            type: String,
        },
        likes: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
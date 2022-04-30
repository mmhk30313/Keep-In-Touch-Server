const mongoose = require("mongoose");

const UserRoleSchema = new mongoose.Schema(
    {
        role_id: {
            type: Number,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            length: 20,
            required: true,
        },
        slug: {
            type: String,
            length: 25,
            unique: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("UserRole", UserRoleSchema);
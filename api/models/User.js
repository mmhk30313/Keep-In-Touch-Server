const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
        type: String,
        min: 5,
        max: 20,
    },
    email: {
        type: String,
        max: 14,
        length: 14,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        max: 5,
        length: 5,
    },
    password: {
        type: String,
        max: 14,
        length: 14,
    },
    gender: {
        type: String,
        max: 10,
        length: 10,
    },
    img: {
        type: String,
    },
    designation: {
        type: String,
        max: 18,
        length: 18,
    },
    description: {
        type: String,
    },
    address: {
        type: String,
    },
    postList:[
        String
    ],
    role: {
        type: String,
        default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
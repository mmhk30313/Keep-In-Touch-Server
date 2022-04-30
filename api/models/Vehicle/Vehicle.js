const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            length: 20,
        },
        reg_no: {
            type: String,
            required: true,
            unique: true,
        },
        user_email: {
            type: String,
            length: 14,
            required: true,
        },
        model: {
            type: String,
            length: 20,
            required: true,
        },
        color: {
            type: String,
            length: 15,
            required: true,
        },
        img: {
            type: String,
            default: "",
        },
        tow_type: {
            type: String,
            length: 20,
            default: ""
        },
        status: {
            type: Boolean,
            default: false,
        },
    },
    {timestamps: true}
);

module.exports = mongoose.model('Vehicle', VehicleSchema);
const mongoose = require('mongoose');
const TowCategorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            length: 20,
            unique: true,
            required: true,
        },
        img: {
            type: String,
            unique: true,
            default: "",
        },
        vehicle_reg_no: [String],
        slug: {
            type: String,
            length: 20,
            unique: true,
        }
    },
    {timestamps: true}
)

module.exports = mongoose.model('TowCategory', TowCategorySchema);

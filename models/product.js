const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: String,
    price: Number,
    description: String,
    company: {
        type: Schema.Types.ObjectId,
        ref: "Company",
    },
    amountBought: Number,
});

module.exports = mongoose.model("Product", productSchema);
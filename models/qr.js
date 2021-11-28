const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const qrSchema = new Schema({
    section: {
        type: Schema.Types.ObjectId,
        ref: "Section",
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
    },

    company: {
        type: Schema.Types.ObjectId,
        ref: "Company",
    },
});

module.exports = mongoose.model("Qr", qrSchema);
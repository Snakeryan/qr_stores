const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sectionSchema = new Schema({
    name: String,
    products: [{
        type: Schema.Types.ObjectId,
        ref: "Product",
    }, ],
    company: {
        type: Schema.Types.ObjectId,
        ref: "Company",
    },
});

module.exports = mongoose.model("Section", sectionSchema);
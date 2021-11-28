const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserAnalyticsSchema = new Schema({
    days: [String],

    receipts: [{
        store: {
            name: String,
            email: String,
        },
        total: Number,

        products: [{
            name: String,
            price: Number,
            description: String,
            quantity: Number,
        }, ],
    }, ],

    totalAmountSpentToday: Number,
    totalAmountSpentByDay: [Number],
});

module.exports = mongoose.model("UserAnalytic", UserAnalyticsSchema);

// {"name":"hi","price":3,"description":"hi","id":"61a2fa2873c5c4b80e8f4a0d","quantity":"4"}
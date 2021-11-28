const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CompanyAnalyticsSchema = new Schema({
    days: [String],
    totalShoppersToday: Number,

    totalShoppersByDay: [Number],

    totalAmountEarnedToday: Number,
    totalAmountEarnedByDay: [Number],
});

module.exports = mongoose.model("CompanyAnalytic", CompanyAnalyticsSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const companySchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    description: String,
    sections: [{
        type: Schema.Types.ObjectId,
        ref: "Section",
    }, ],
    products: [{
        type: Schema.Types.ObjectId,
        ref: "Product",
    }, ],
    // qrs: [{
    //     type: Schema.Types.ObjectId,
    //     ref: "Qr",
    // }],
    companyAnalytics: {
        type: Schema.Types.ObjectId,
        ref: "CompanyAnalytic",
    },
});

companySchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Company", companySchema);
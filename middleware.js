const ExpressError = require("./utils/express_error");
const { campgroundSchema, reviewSchema } = require("./schemas")
const Campground = require("./models/campground");
const Review = require("./models/review")

module.exports.isLoggedIn = (req, res, next) => {
    // console.log("User:", req.user)
    if (!req.isAuthenticated()) {
        req.flash("error", "Must sign in.");
        res.redirect("/login")
    } else {
        next();
    }
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "Invalid credentials.");
        res.redirect(`/campgrounds/${id}`);
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "Invalid credentials.");
        res.redirect(`/campgrounds/${id}`);
    } else {
        next();
    }
}
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
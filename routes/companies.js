const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");

const companies = require("../controllers/companies");

router
    .route("/register")
    .get(companies.renderRegisterForm)
    .post(wrapAsync(companies.registerCompany));

router.get(
    "/dashboard",
    wrapAsync(companies.companyIsLoggedIn),
    wrapAsync(companies.renderDashboard)
);

router
    .route("/setup")
    .get(wrapAsync(companies.companyIsLoggedIn), companies.renderSetup)
    .post(wrapAsync(companies.setupCompany));

// router.get(
//     "/login",
//     // passport.authenticate("company", {
//     //     failureRedirect: "/login",
//     //     failureFlash: true,
//     // }),
//     login
// );
// router.delete(
//     "/:reviewId",
//     isLoggedIn,
//     isReviewAuthor,
//     wrapAsync(reviews.deleteReview)
// );

module.exports = router;
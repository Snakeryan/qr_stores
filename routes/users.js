const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const users = require("../controllers/users");

// const router = express.Router();
const router = express.Router({ mergeParams: true });

router
    .route("/register")
    .get(users.renderRegister)
    .post(wrapAsync(users.register));

router.get(
    "/analytics",
    wrapAsync(users.userIsLoggedIn),
    users.renderDashboard
);

// passport.use("user", new LocalStrategy(User.authenticate()));
// router.get(
//     "/login",
//     passport.authenticate("user", {
//         failureRedirect: "/login",
//         failureFlash: true,
//     }),
//     users.login
// );

module.exports = router;
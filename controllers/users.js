const User = require("../models/user");
const UserAnalytics = require("../models/user_analytics");

module.exports.renderRegister = (req, res) => {
    res.render("users/register");
};

module.exports.renderDashboard = async(req, res) => {
    const user = await User.findById(req.user._id).populate("userAnalytics");
    const userAnalytics = user.userAnalytics;

    res.render("users/dashboard", { user, userAnalytics });
};

module.exports.userIsLoggedIn = async(req, res, next) => {
    if (req.session && req.session.user) {
        // console.log(req.session);
        const user = await User.findById(req.session.user.id);
        // console.log("company", company);
        if (user) {
            return next();
        }
    }
    req.flash("error", "You need to be logged in to do that.");
    res.redirect("/login");
};

module.exports.register = async(req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const userAnalytics = new UserAnalytics({
            days: [],
            receipts: [],
            totalAmountSpentToday: 0,
            totalAmountSpentByDay: [],
        });

        await userAnalytics.save();

        const user = new User({ username, email, userAnalytics });
        const registereduser = await User.register(user, password);
        await user.save();

        req.login(registereduser, (err) => {
            if (err) next(err);
            else {
                req.flash("success", "Welcome.");
                res.redirect("/scan");
            }
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("register");
    }
};

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back.");
    const redirectUrl = req.session.returnTo || "/campgrounds";
    console.log(redirectUrl);
    delete req.session.returnTo;
    res.redirect("/scan");
};
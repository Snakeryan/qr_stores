const User = require("../models/user")




module.exports.renderRegister = (req, res) => {
    res.render("users/register")
}

module.exports.register = async(req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registereduser = await User.register(user, password);
        req.login(registereduser, err => {
            if (err) next(err);
            else {
                req.flash("success", "Welcome.");
                res.redirect("/campgrounds");
            }

        })


    } catch (e) {
        req.flash("error", e.message)
        res.redirect("register")
    }


}

module.exports.renderLogin = (req, res) => {
    res.render("users/login")
}

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back.");
    const redirectUrl = req.session.returnTo || "/campgrounds";
    console.log(redirectUrl)
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash("success", "Logged out.")
    res.redirect("/campgrounds");
}
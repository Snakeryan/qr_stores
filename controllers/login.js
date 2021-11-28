module.exports.renderLogin = (req, res) => {
    res.render("login");
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash("success", "Logged out.");
    res.redirect("/");
};
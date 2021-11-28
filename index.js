if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/express_error");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const companyRoutes = require("./routes/companies");
const userRoutes = require("./routes/users");
const storeRoutes = require("./routes/store");

const Company = require("./models/company");
const User = require("./models/user");

const login = require("./controllers/login");

const MongoStore = require("connect-mongo");

const dbUrl = "mongodb://localhost:27017/qr-supermarket-prj";
// process.env.DB_URL || "mongodb://localhost:27017/qr-supermarket-prj";
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

app.use(helmet({ contentSecurityPolicy: false }));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/@mdi/font@4.8.95/css/materialdesignicons.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
    " https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/@mdi/font@4.8.95/css/materialdesignicons.min.css",
    "https://use.fontawesome.com/",
    "https://fonts.googleapis.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/dzbat8o0x/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
//                 "https://images.unsplash.com/",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );

const secret = process.env.SECRET || "thisshouldbeabettersecret!";

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60,
});

store.on("error", function(e) {
    console.log("Session store error:", e);
});

const sessionConfig = {
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    // passport: {
    //     user: { id: "", type: "" },
    // },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use("user", new LocalStrategy(User.authenticate()));
passport.use("company", new LocalStrategy(Company.authenticate()));

passport.serializeUser(function(user, done) {
    console.log(user);
    var key = {
        id: user.id,
        type: user.description ? "Company" : "User",
    };
    console.log(key);
    done(null, key);
});

passport.deserializeUser(function(key, done) {
    // this could be more complex with a switch or if statements
    var Model = key.type === "Company" ? Company : User;
    Model.findOne({
            _id: key.id,
        },
        "-salt -password",
        function(err, user) {
            done(err, user);
        }
    );
});

app.use((req, res, next) => {
    try {
        const cart = req.session.cart;
        console.log(req.session.cart);
        if (cart) {
            res.locals.cartItemAmount = cart.cartItemAmount || 0;
        } else {
            res.locals.cartItemAmount = 0;
        }
        console.log("hi");
        console.log(res.locals.cartItemAmount, "hi");

        res.locals.currentUser = req.user;
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
    } catch (error) {
        // console.log(req.user, "user");
        console.log(error);
    }
    next();
});

app.use("/users", userRoutes);

app.use("/companies", companyRoutes);
app.use("/", storeRoutes);

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/register", (req, res) => {
    // console.log("hi");
    res.render("registration_redirect");
});

app
    .route("/login")
    .get(login.renderLogin)
    .post(authenticateUser, renderCorrectPage);

app.get("/logout", login.logout);

function authenticateUser(req, res, next) {
    const { isCompany } = req.body;

    // console.log(req.body);

    if (isCompany === "on") {
        passport.authenticate("company", {
            failureRedirect: "/login",
            failureFlash: true,
        })(req, res, next);
    } else {
        passport.authenticate("user", {
            failureRedirect: "/login",
            failureFlash: true,
        })(req, res, next);
    }
}

function renderCorrectPage(req, res) {
    const { isCompany } = req.body;

    console.log(req.session);
    const id = req.session.passport.user.id;
    const type = req.session.passport.user.type;

    req.session.user = { id, type, isCompany };

    // console.log("user", id, type);

    user = { id, type };

    if (isCompany === "on") {
        res.redirect("companies/dashboard");
    } else {
        res.redirect("/scan");
    }
}

app.get("/users/login", (req, res) => {
    // console.log("body", "j", req.body);
});
// .get(users.renderLogin)
// .post(
//     passport.authenticate("local", {
//         failureFlash: true,
//         failureRedirect: "/login",
//     }),
//     users.login
// );

app.all("*", (req, res, next) => {
    res.render("404");
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong!";
    res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});
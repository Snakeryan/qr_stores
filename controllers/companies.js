const Qr = require("../models/qr");
const Section = require("../models/section");
const Product = require("../models/product");
const CompanyAnalytics = require("../models/company_analytics");
const Company = require("../models/company");

async function setupCompany(req, res) {
    try {
        const { user } = req.session;

        const { products } = req.body;
        console.log(products.length);

        const company = await Company.findById(user.id);

        if (!company.products) {
            company.products = [];
        }

        if (!company.sections) {
            company.sections = [];
        }
        if (!company.companyAnalytics) {
            company.companyAnalytics = {};
        }

        // console.log(company, user.id);

        await pushToDatabase(products, company);

        console.log("hi");
        await company.save();
        console.log("hi");

        const savedProducts = [];

        for (let i = 0; i < company.products.length; i++) {
            savedProducts.push(await Product.findById(company.products[i]));
        }

        const savedSections = [];

        for (let i = 0; i < company.sections.length; i++) {
            savedSections.push(await Section.findById(company.sections[i]));
        }
        // console.log("company", company);
        const response = {
            products: savedProducts,
            sections: savedSections,
        };

        console.log(response);
        res.send(response);
        // req.flash("success", "Your store is setup.");
        // res.redirect("/companies/dashboard");
    } catch (e) {
        console.log(e);
        // req.flash("error", e.message);
        // res.redirect("/companies/dashboard");
        res.send("error");
    }
}

async function pushToDatabase(products, company) {
    for (let i = 0; i < products.length; i++) {
        const sentProduct = products[i];

        // console.log(sentProduct);

        let product = await Product.findOne({
            company: company._id,
            name: sentProduct.name,
        });

        // console.log(product);
        if (!product) {
            product = new Product({
                ...sentProduct,
                company: company._id,
                amountBought: 0,
            });
            await product.save();

            console.log(product);

            company.products.push(product._id);

            // const qr = new Qr({company, product});
            // await qr.save();
        } else if (company.products.indexOf(product._id) === -1) {
            company.products.push(product);
        }
        // console.log(sentProduct.section);
        if (sentProduct.section) {
            await makeOrModifySection(product, company, sentProduct.section);
        }
    }
}

async function makeOrModifySection(product, company, sectionName) {
    // console.log(product);
    try {
        const section = await Section.findOne({
            name: sectionName,
            company: company._id,
        });

        // console.log;
        // console.log("hi");

        if (section) {
            if (section.products.indexOf(product._id) !== -1) {
                return;
            }

            section.products.push(product._id);
            await section.save();
        } else {
            // console.log("firsNnewSection");

            const newSection = new Section({
                name: sectionName,
                company: company._id,
                products: [product._id],
            });

            // console.log("newSection");

            // console.log("newSection");

            await newSection.save();

            company.sections.push(newSection._id);

            // console.log("newSection", newSection);

            // const qr = new Qr({ section: newSection, company });
            // qr.save();
        }
    } catch (e) {
        console.log(e);
    }
}

// qrs are unnecessary as products and sections can reference the company, and a QR can be linked to those products

function login(req, res) {
    req.flash("success", "Welcome back.");
    const redirectUrl = req.session.returnTo || "/companies/dashboard";
    console.log(redirectUrl);
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

function renderSetup(req, res) {
    console.log("hi");

    res.render("companies/setup");
}

async function companyIsLoggedIn(req, res, next) {
    const { user } = req.session;

    if (user) {
        // console.log(req.session);
        const company = await Company.findById(user.id);
        // console.log("company", company);
        if (company) {
            req.company = company;
            return next();
        }
    }
    req.flash("error", "You need to be logged in to do that.");
    res.redirect("/login");
}

function renderRegisterForm(req, res) {
    res.render("companies/register");
}

async function registerCompany(req, res, next) {
    try {
        const { companyName: username, email, password, description } = req.body;
        console.log(username, email, password, description);

        const companyAnalytics = new CompanyAnalytics({
            days: [],
            totalShoppersToday: 0,

            totalShoppersByDay: [],

            totalAmountEarnedToday: 0,
            totalAmountEarnedByDay: [],
        });
        await companyAnalytics.save();
        console.log(companyAnalytics, "saved");

        const company = new Company({
            username,
            email,
            description,
            products: [],
            sections: [],
            companyAnalytics: companyAnalytics,
        });
        // console.log(company);
        // console.log(company);
        const registeredCompany = await Company.register(company, password);

        req.login(registeredCompany, (err) => {
            if (err) next(err);
            else {
                // req.flash(
                //     "success",
                //     "This form will take you through the store setup process. By the end, you can download a PDF of QRs representing products and a PDF of QRs representing sections."
                // );
                res.redirect("/companies/dashboard");
            }
        });
    } catch (e) {
        console.log(e);
        req.flash("error", e.message);
        res.redirect("register");
    }
}

async function renderDashboard(req, res) {
    try {
        const { user } = req.session;

        const company = await Company.findById(user.id)
            .populate("products")
            .populate("sections")
            .populate("companyAnalytics");

        let companyAnalytics = company.companyAnalytics;

        if (!companyAnalytics) {
            companyAnalytics = {};
        }
        console.log(companyAnalytics, "company");

        res.render("companies/dashboard", { company, companyAnalytics });
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    setupCompany,
    renderRegisterForm,
    registerCompany,
    renderSetup,
    setupCompany,
    companyIsLoggedIn,
    renderDashboard,
};
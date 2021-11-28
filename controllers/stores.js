const Product = require("../models/product");
const Section = require("../models/section");
const Company = require("../models/company");
const CompanyAnalytics = require("../models/company_analytics");

const User = require("../models/user");
const UserAnalytics = require("../models/user_analytics");

function noItemsInCart(req, res, next) {
    const cart = req.session.cart;

    if (cart && cart.products && cart.products.length > 0) {
        next();
    } else {
        req.flash("error", "There are no items in the cart.");
        res.redirect("/scan");
    }
}

async function getProductFromDatabase(req, res) {
    try {
        const { productId } = req.body;

        const product = await Product.findById(productId);

        console.log(product);

        console.log(product.company, "company");

        setStore(req, product.company);

        console.log(product);

        const products = req.session.cart.products;

        console.log(productId, "productId", products);
        const productInCart = products.find((p) => p.id === product.id);

        console.log(products, "product", productInCart, "product");

        const modifiedProduct = {
            name: product.name,
            price: product.price,
            description: product.description,
            id: product._id,
            quantity: productInCart ? productInCart.quantity : 0,
        };

        console.log("session", req, session);
        res.send({ product: modifiedProduct, cartTotal: req.session.cartTotal });
    } catch (error) {
        console.log(error);
    }
}

async function getSectionFromDatabase(req, res) {
    try {
        console.log(req.body);
        const { sectionId } = req.body;

        const products = req.session.cart.products;

        const section = await Section.findById(sectionId).populate("products");

        setStore(req, section.company);

        console.log(section.company);

        const modifiedSection = {
            name: section.name,
            products: section.products.map((product) => {
                const p = products.find((p) => p.id === product.id);
                return {
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    id: product._id,
                    quantity: p ? p.quantity : 0,
                };
            }),
        };
        console.log("section", modifiedSection);
        res.send({ section: modifiedSection });
    } catch (error) {
        console.log(error);
    }
}

function setStore(req, companyId) {
    console.log(req.session);
    if (!req.session.store) {
        req.session.store = companyId;
    }
    console.log("company", req.session.store);
}

function renderScan(req, res) {
    if (!req.session.cart) {
        req.session.cart = {
            products: [],
            total: 0,
        };
    }
    res.render("scan");
}

function addToCart(req, res) {
    try {
        const { products, total } = req.body;

        const productsInCart = req.session.cart.products;

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            // console.log("product", product);

            const productInCart = productsInCart.find((p) => p.id === product.id);

            if (productInCart) {
                for (let key in product) {
                    productInCart[key] = product[key];
                }
            } else {
                if (product.quantity > 0) {
                    productsInCart.push({
                        ...product,
                    });
                }
            }
        }

        setCartTotals(productsInCart, total, req);

        // console.log(req.session.cart);

        res.send({ cartItemAmount: req.session.cart.cartItemAmount });
    } catch (error) {
        console.log("error", error);
        res.send(error);
    }
}

function setCartTotals(products, total, req) {
    const cartItemAmount = products.reduce((sum, current) => {
        return sum + parseInt(current.quantity);
    }, 0);

    req.session.cart.cartItemAmount = cartItemAmount;

    console.log(req.session.cart.cartItemAmount, "cartotalamout");

    req.session.cart.total = total;
}

function deleteFromCart(req, res) {
    try {
        const { product, isDeleteAll } = req.body;

        console.log(req.body, "req.body");
        console.log(req, "req");
        console.log(isDeleteAll, "isDeleteAll");
        if (!isDeleteAll) {
            const products = req.session.cart.products;

            console.log(products, "products");
            console.log(req.session.cart.products, "products");
            products.splice(products.indexOf(product), 1);
            console.log(products, "products");
            console.log(req.session.cart.products, "products");

            setCartTotals(products, findTotal(products), req);

            res.send("deleted");
        } else {
            clearCart(req);
            res.send("deleted all");
        }
    } catch (e) {
        console.log(e);
        res.send(e);
    }
}

function findTotal(products) {
    const total = products.reduce((sum, current) => {
        return (
            parseInt(sum.quantity * sum.price) ||
            sum + parseInt(current.quantity * current.price) ||
            current
        );
    }, 0);

    return total;
}

function renderCart(req, res) {
    renderProductInformationPage(req, res, "cart");
}

function renderProductInformationPage(req, res, page) {
    try {
        const products = req.session.cart.products;

        if (products.length === 0) {
            throw new Error("No products in cart");
        }
        console.log("total", "total");

        res.render(page, { products, total: req.session.cart.total });
    } catch (error) {
        console.log(error);

        req.flash("error", "There are no items in the cart.");
        res.redirect("/scan");
    }
}

async function checkout(req, res, next) {
    try {
        const { products, total } = req.session.cart;

        await modifyAnalytics(req, products, total);

        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
}

function clearCart(req) {
    req.session.cart = {
        products: [],
        total: 0,
        cartItemAmount: 0,
    };
}

async function modifyAnalytics(req, products, total) {
    const date = new Date().toString().substring(4, 15);

    const company = await Company.findById(req.session.store)
        .populate("companyAnalytics")
        .populate("products");
    await modifyCompanyAnalytics(req, products, total, date, company);
    // clearCart(req);

    console.log("user.req", req.user);
    if (req.user && req.user.userAnalytics) {
        console.log("user", req.user);
        const user = await User.findById(req.user._id).populate("userAnalytics");

        console.log("user", user);
        await modifyUserAnalytics(req, products, total, date, user, company);
    }
}
async function modifyCompanyAnalytics(req, products, total, date, company) {
    let companyAnalytics = company.companyAnalytics;
    if (!companyAnalytics) {
        companyAnalytics = new CompanyAnalytics({
            days: [],
            totalShoppersToday: 0,

            totalShoppersByDay: [],

            totalAmountEarnedToday: total,
            totalAmountEarnedByDay: [],
        });

        await companyAnalytics.save();
        company.companyAnalytics = companyAnalytics;
    }

    setProductAmounts(company, products);

    console.log(company.companyAnalytics, "companyAnalytics");
    console.log(companyAnalytics, "companyAnalytics1");

    let days = companyAnalytics.days;
    console.log(days, "days");
    if (!days) {
        companyAnalytics.days = [];
        days = companyAnalytics.days;
    }

    if (days.length === 0) {
        companyAnalytics.days.push(date);
    } else if (days[days.length - 1] !== date) {
        companyAnalytics.days.push(date);

        console.log(companyAnalytics.days, "days");

        companyAnalytics.totalShoppersByDay.push(
            companyAnalytics.totalShoppersToday,
            0
        );
        companyAnalytics.totalShoppersToday = 0;

        companyAnalytics.totalAmountEarnedByDay.push(
            companyAnalytics.totalAmountEarnedToday,
            0
        );
        companyAnalytics.totalAmountEarnedToday = 0;
    }

    companyAnalytics.totalAmountEarnedToday += total;
    const totalIndex = companyAnalytics.totalAmountEarnedByDay.length - 1;
    companyAnalytics.totalAmountEarnedByDay[totalIndex < 0 ? 0 : totalIndex] =
        companyAnalytics.totalAmountEarnedToday;

    companyAnalytics.totalShoppersToday += 1;
    const shopperIndex = companyAnalytics.totalShoppersByDay.length - 1;
    companyAnalytics.totalShoppersByDay[shopperIndex < 0 ? 0 : shopperIndex] =
        companyAnalytics.totalShoppersToday;

    console.log(company.companyAnalytics);
    await companyAnalytics.save();

    await company.save();

    console.log(company.companyAnalytics, "analytics");
}

/* 

    days: [String],

    receipts: [{
        store: String,
        total: Number,
        products: [
            name: String,
            price: Number,
            description: String,
            quantity: Number,
        ],

    }],

    totalAmountSpentToday: Number,
    totalAmountSpentByDay: [Number],
*/
async function modifyUserAnalytics(req, products, total, date, user, company) {
    console.log("userAnalytics", user);

    try {
        let userAnalytics = user.userAnalytics;

        let days = userAnalytics.days;
        console.log(days, "days");

        if (days.length === 0) {
            userAnalytics.days.push(date);
        } else if (days[days.length - 1] !== date) {
            userAnalytics.days.push(date);

            userAnalytics.totalAmountEarnedByDay.push(
                userAnalytics.totalAmountEarnedToday,
                0
            );
            userAnalytics.totalAmountSpentToday = 0;
        }

        userAnalytics.totalAmountSpentToday += total;
        const totalIndex = userAnalytics.totalAmountSpentByDay.length - 1;
        userAnalytics.totalAmountSpentByDay[totalIndex < 0 ? 0 : totalIndex] =
            userAnalytics.totalAmountSpentToday;

        userAnalytics.receipts.push({
            store: { name: company.username, email: company.email },
            total: total,
            products: products,
        });
        await userAnalytics.save();
        await user.save();

        console.log("user", user);
        console.log("userAnalytics", userAnalytics);
    } catch (error) {
        console.log(error);
    }
}

async function setProductAmounts(company, products) {
    products.forEach(async(product) => {
        company.products.find((p) => p.id === product.id).amountBought += parseInt(
            product.quantity
        );

        const productInDatabase = await Product.findById(product.id);
        productInDatabase.amountBought += parseInt(product.quantity);
        await productInDatabase.save();
    });
}

// const companyAnalyticsSchema = new Schema({
//     shopperIds: [String],
//     days: [String],
//     totalUniqueShoppers: Number,
//     totalShoppersToday: Number,
//     totalUniqueShoppersToday: Number,
//     totalShoppersByDay: [{
//         shoppers: Number,
//     }, ],
//     totalAmountEarnedToday: Number,
//     totalAmountEarnedByDay: [Number],
// });

module.exports = {
    noItemsInCart,
    renderCart,
    addToCart,
    deleteFromCart,
    getProductFromDatabase,
    getSectionFromDatabase,
    renderProductInformationPage,
    renderScan,
    checkout,
};
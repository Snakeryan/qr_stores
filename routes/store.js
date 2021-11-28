const express = require("express");
const router = express.Router({ mergeParams: true });

const stores = require("../controllers/stores");

const wrapAsync = require("../utils/wrapAsync");

router.get("/scan", stores.renderScan);

router
    .route("/cart")
    .get(stores.noItemsInCart, stores.renderCart)
    .patch(stores.addToCart)
    .delete(stores.deleteFromCart);

router.post("/get/product", wrapAsync(stores.getProductFromDatabase));

router.post("/get/section", wrapAsync(stores.getSectionFromDatabase));

router.post("/add/to/cart", wrapAsync(stores.addToCart));

router.get(
    "/checkout",
    stores.noItemsInCart,
    wrapAsync(stores.checkout),
    (req, res) => {
        stores.renderProductInformationPage(req, res, "checkout");
    }
);

module.exports = router;
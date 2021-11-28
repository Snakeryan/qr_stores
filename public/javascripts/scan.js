const video = document.getElementById("qr-video");

const editCartModalButton = document.querySelector("#edit-cart-modal");

const cart = new Cart();
async function setResult(result) {
    console.log(result);

    cart.removeAllProducts();

    const id = result.substring(0, result.indexOf("."));

    const type = result.substring(result.indexOf(".") + 1);

    let response;
    if (type === "product") {
        response = await axios.post("/get/product", {
            productId: id,
        });
        console.log(response);
        const { product } = response.data;
        cart.addProducts({...product });

        // console.log(response);
        renderProductTableBody(cart.getProducts(), product.name);
    } else {
        response = await axios.post("/get/section", {
            sectionId: id,
        });

        const { section } = response.data;

        cart.addProducts(...section.products);
        renderProductTableBody(cart.getProducts(), section.name);

        // console.log(response);
    }

    console.log(response);

    cart.setTotal(response.data.cartTotal);

    document.querySelector("#cart-total").innerText = `$${cart.getTotal()}`;

    editCartModalButton.click();

    scanner.stop();
}

function renderProductTableBody(products, name) {
    const productTableBody = document.querySelector("#product-table-body");

    productTableBody.innerHTML = "";

    const label = document.querySelector("#addToCartModalLabel");
    label.innerText = name;

    console.log(products);
    products.forEach((product, i) => {
        const row = getProductRow(product, i);
        productTableBody.append(row);
    });

    // const addToCart = document.createElement("td");
    // addToCart.innerHTML = `<button class="btn btn-primary" onclick="addToCart(${product.id})">Add to cart</button>`;
}

function getProductRow(product, i) {
    const row = document.createElement("tr");
    // console.log(product);

    // console.log(product);
    // for (let key in product) {
    //     if (key === "id") {
    //         continue;
    //     }

    //     const td = document.createElement("td");

    //     td.innerText = product[key];
    //     td.id = `${key}-${i}`;

    //     if (key === "price") {
    //         td.price = product[key];
    //     } else if (key === "quantity") {
    //         td.innerHTML = "";
    //         td.append(makeQuantityInput(product[key], i));
    //     }

    //     row.append(td);
    // }
    const nameTd = document.createElement("td");
    nameTd.innerText = product.name;
    nameTd.id = `name-${i}`;
    row.append(nameTd);

    const priceTd = document.createElement("td");
    priceTd.innerText = `$${product.price}`;
    priceTd.id = `price-${i}`;
    priceTd.price = product.price;
    row.append(priceTd);

    const descriptionTd = document.createElement("td");
    descriptionTd.innerText = product.description || "N/A";
    descriptionTd.id = `description-${i}`;
    row.append(descriptionTd);

    const quantityTd = document.createElement("td");
    quantityTd.append(makeQuantityInput(product.quantity, i));
    row.append(quantityTd);

    return row;
}

function makeQuantityInput(quantity, i) {
    const quantityInput = document.createElement("input");
    quantityInput.className = "form-control";
    quantityInput.type = "number";
    quantityInput.id = `quantity-${i}`;

    quantityInput.value = quantity;
    quantityInput.min = 0;
    quantityInput.addEventListener("input", (e) => quantityChangeEvent(e, i));

    return quantityInput;
}

function quantityChangeEvent(e, i) {
    let quantity = e.target.value;
    if (quantity < 0) {
        e.target.value = 0;
        quantity = 0;
    }

    const priceTd = document.querySelector(`#price-${i}`);

    cart.changeQuantity(i, quantity);
    const { price } = cart.getProduct(i);
    priceTd.innerText = `$${(price * quantity).toFixed(2)}`;

    const cartTotalSpan = document.querySelector("#cart-total");
    cartTotalSpan.innerText = `$${cart.getTotal()}`;
}

const closeButton = document.querySelector("#close-button");
closeButton.addEventListener("click", () => {
    scanner.start();
});

const addToCartButton = document.querySelector("#add-to-cart-button");
addToCartButton.addEventListener("click", addToCartEvent);

async function addToCartEvent() {
    const products = cart.getProducts();

    const response = await axios.patch("/cart", {
        products,
        total: cart.getTotal(),
    });
    console.log(response);

    const { cartItemAmount } = response.data;

    const cartItemAmountSpan = document.querySelector("#cart-item-amount-span");
    cartItemAmountSpan.classList.remove("d-none");
    cartItemAmountSpan.innerText = cartItemAmount;

    closeButton.click();
}

// function renderCart(cart) {
//     const cartTableBody = document.querySelector("#cart-table-body");
//     cartTableBody.innerHTML = "";

//     cart.forEach((product) => {
//         const row = getCartRow(product);
//         cartTableBody.append(row);
//     });
// }

// function getCartRow(product) {
//     const row = document.createElement("tr");

//     const name = document.createElement("td");
//     name.innerText = product.name;

//     const price = document.createElement("td");
//     price.innerText = product.price;

//     const quantity = document.createElement("td");
//     quantity.innerText = product.quantity;

//     const removeFromCart = document.createElement("td");
//     removeFromCart.innerHTML = `<button class="btn btn-danger" onclick="removeFromCart(${product.id})">Remove from cart</button>`;

//     row.append(name, price, quantity, removeFromCart);

//     return row;
// }

// ####### Web Cam Scanning #######

const scanner = new QrScanner(
    video,
    (result) => setResult(result),
    (error) => {
        // console.log(error);
        // camQrResult.textContent = error;
        // camQrResult.style.color = "inherit";
    }
);

scanner.start().then(async() => {
    placeScanVideo();
    document.querySelector("#preload-image").remove();
});

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// document.getElementById("start-button").addEventListener("click", () => {
//     scanner.start();
// });

// document.getElementById("stop-button").addEventListener("click", () => {
//     scanner.stop();
// });

function placeScanVideo() {
    const scanCard = document.querySelector("#scan-card");
    console.log(scanCard);
    scanner.$canvas.classList.add("img-fluid", "img-thumbnail");
    scanner.$canvas.id = "scanner-canvas";

    console.log(scanner.$canvas);
    scanCard.prepend(scanner.$canvas);
}

// List cameras after the scanner started to avoid listCamera's stream and the scanner's stream being requested
// at the same time which can result in listCamera's unconstrained stream also being offered to the scanner.
// Note that we can also start the scanner after listCameras, we just have it this way around in the demo to
// start the scanner earlier.
// QrScanner.listCameras(true).then((cameras) =>
//   cameras.forEach((camera) => {
//     const option = document.createElement("option");
//     option.value = camera.id;
//     option.text = camera.label;
//     camList.add(option);
//   })
// );
const cart = new Cart();

console.log(JSON.stringify(products));
renderCart(products);

function renderCart(products) {
    const cartUl = document.querySelector(".cartWrap");

    cart.addProducts(...products);

    for (let i = 0; i < products.length; i++) {
        renderCartProduct(i, products[i]);
    }

    const checkoutButton = document.querySelector("#checkout-button");
    checkoutButton.addEventListener("click", goToCheckoutEvent);
}

function renderCartProduct(i, { name, price, quantity }) {
    const productLi = document.createElement("li");
    productLi.classList.add("items");
    productLi.classList.add(i % 2 === 0 ? "odd" : "even");
    productLi.id = `product-${i}`;

    productLi.innerHTML = getProductLiHTML(name, price, quantity, i);

    const removeButton = productLi.querySelector(".remove");
    removeButton.addEventListener("click", (e) => removeButtonEvent(e, i));

    const qtyInput = productLi.querySelector(".qty");
    qtyInput.addEventListener("input", (e) => quantityChangeEvent(e, i));

    const cartUl = document.querySelector(".cartWrap");
    cartUl.append(productLi);
}

function removeButtonEvent(e, i) {
    cart.removeProduct(i);

    const productLi = document.getElementById(`product-${i}`);
    productLi.remove();

    const subtotal = cart.getTotal();
    setTotal(subtotal);

    axios.delete("/cart", {
        product: cart.getProduct(i),
    });

    const cartItemAmountSpan = document.querySelector("#cart-item-amount-span");
    cartItemAmountSpan.innerText = cart.getCartItemAmount();
}

function quantityChangeEvent(e, i) {
    let quantity = e.target.value;
    if (quantity < 0) {
        e.target.value = 0;
        quantity = 0;
    }

    const totalAmountP = document.querySelector(`#total-amount-${i}`);

    cart.changeQuantity(i, quantity);
    const { price } = cart.getProduct(i);

    totalAmountP.innerText = `$${(price * quantity).toFixed(2)}`;

    const subtotal = cart.getTotal();
    setTotal(subtotal);

    const cartItemAmountSpan = document.querySelector("#cart-item-amount-span");
    cartItemAmountSpan.innerText = cart.getCartItemAmount();
}

function setTotal(subtotal) {
    const cartSubtotalSpan = document.querySelector("#cart-subtotal");
    cartSubtotalSpan.innerText = `$${subtotal.toFixed(2)}`;

    const cartTaxSpan = document.querySelector("#cart-tax");
    cartTaxSpan.innerText = `$${(subtotal * 0.0725).toFixed(2)}`;

    const cartTotalSpan = document.querySelector("#cart-total");
    cartTotalSpan.innerText = `$${(subtotal * 1.0725).toFixed(2)}`;
}

async function goToCheckoutEvent() {
    const products = cart.getProducts();

    const response = await axios.patch("/cart", {
        products,
        total: cart.getTotal(),
    });

    window.location.href = "/checkout";
}

function getProductLiHTML(name, price, quantity, i) {
    return `
  <div class="infoWrap">
      <div class="cartSection">
          <img src="http://lorempixel.com/output/technics-q-c-300-300-4.jpg" alt="" class="itemImg" />
          <h3>${name}</h3>

          <p><input type="text" class="qty" value="${quantity}" /> x $${price}</p>

          <p class="stockStatus in">In Stock</p>
      </div>

      <div class="prodTotal cartSection">
          <p id="total-amount-${i}">$${price * quantity}</p>
      </div>
      <div class="cartSection removeWrap">
          <a href="#" class="remove">x</a>
      </div>
  </div>
  `;
}
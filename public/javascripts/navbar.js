const navBarTogglerButton = document.querySelector("#navbar-toggler-button");

navBarTogglerButton.addEventListener("click", updateCartItemLocationEvent);

function updateCartItemLocationEvent(e) {
    const cartItemAmountSpan = document.querySelector("#cart-item-amount-span");

    const isCollapsed = e.target.classList.contains("collapsed");

    if (isCollapsed) {
        const navBarBrand = document.querySelector(".navbar-brand");

        navBarBrand.append(cartItemAmountSpan);
    } else {
        const cartAnchorTag = document.querySelector("#cart-anchor-tag");
        cartAnchorTag.append(cartItemAmountSpan);
    }
}
renderProductTableBody(products);

function renderProductTableBody(products) {
    const productTableBody = document.querySelector(
        "#product-analytics-table-body"
    );

    productTableBody.innerHTML = "";

    const modifiedProduct = products.map((product) => {
        return {
            ...product,
            totalAmountEarned: product.amountBought * product.price,
        };
    });
    const sortedProducts = modifiedProduct.sort(function({ totalAmountEarned: a }, { totalAmountEarned: b }) {
        return b - a;
    });

    console.log(sortedProducts);
    sortedProducts.forEach((product, i) => {
        const row = getProductRow(product, i);
        productTableBody.append(row);
    });

    // const addToCart = document.createElement("td");
    // addToCart.innerHTML = `<button class="btn btn-primary" onclick="addToCart(${product.id})">Add to cart</button>`;
}

function getProductRow(product, i) {
    const row = document.createElement("tr");
    console.log(product);

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

    const totalAmountBoughtTd = document.createElement("td");
    totalAmountBoughtTd.innerText = product.amountBought;
    totalAmountBoughtTd.id = `amount-bought-${i}`;
    row.append(totalAmountBoughtTd);

    const totalAmountEarnedTd = document.createElement("td");
    totalAmountEarnedTd.innerText = `$${(
    product.amountBought * product.price
  ).toFixed(2)}`;
    row.append(totalAmountEarnedTd);

    return row;
}
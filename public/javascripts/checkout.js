console.log(total, cartItemAmount, products);
const invoiceProperties = {
    outputType: "blob",
    returnJsPDFDocObject: true,
    // fileName: "checkout",
    orientationLandscape: false,
    logo: {
        src: "/images/qr_supermarket_logo.png",
        width: 20, //aspect ratio = width/height
        height: 20,
        margin: {
            top: 0, //negative or positive num, from the current position
            left: 0, //negative or positive num, from the current position
        },
    },
    business: {
        name: "QR Stores",
        website: "https://www.qrStores.com",
    },
    invoice: {
        invDate: `Payment Date: ${new Date().toString()}`,
        headerBorder: false,
        tableBodyBorder: false,
        header: ["#", "Name", "Price", "Quantity", "Description", "Total"],
        table: products.map((product, index) => [
            index + 1,
            product.name,
            product.price,
            product.quantity,
            product.description || "N/A",
            product.price * product.quantity,
        ]),
        invTotalLabel: "Total:",
        invTotal: (total * 1.0725).toFixed(2),
        invCurrency: "Dollars",
        row2: {
            col1: "SubTotal:",
            col2: total,
            col3: `Items: ${cartItemAmount}`,
            style: {
                fontSize: 10, //optional, default 12
            },
        },
        invDesc: "Have a great day!",
    },
    footer: {
        text: "QR Stores (c).",
    },
    pageEnable: true,
    pageLabel: "Page ",
};

const pdfObject = jsPDFInvoiceTemplate.default(invoiceProperties);

const receipt = document.querySelector("#receipt");

receipt.setAttribute("src", pdfObject.jsPDFDocObject.output("datauristring"));

resetCart().then((res) => {
    console.log(res);
});

async function resetCart() {
    const response = await axios.delete("/cart", {
        data: {
            isDeleteAll: true,
        },
    });

    document.querySelector("#cart-item-amount-span").innerText = 0;

    return response;
}
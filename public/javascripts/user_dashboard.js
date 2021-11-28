console.log(userAnalytics.receipts);

function changeReceiptPDFEvent(i) {
    const saveReceipt = document.querySelector("#save-receipt");

    if (userAnalytics.receipts && userAnalytics.receipts.length > 0) {
        const { store, total, products } = userAnalytics.receipts[i];

        console.log(store, total, products);
        const cartItemAmount = products.reduce((sum, current) => {
            return sum + parseInt(current.quantity);
        }, 0);
        console.log(cartItemAmount);

        saveReceipt.innerText = "Receipt Saving...";

        const invoiceProperties = {
            outputType: "save",
            fileName: `${store.name}_${total}_${cartItemAmount}_${Date.now()}.pdf`,
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
                name: store.name,
                website: "https://www.qrStores.com",
                email: store.email || "",
            },
            invoice: {
                invDate: `Payment Date: ${userAnalytics.days[i]}`,
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
                    col2: `${total}`,
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

        saveReceipt.innerText = "Receipt Saved!";
    } else {
        saveReceipt.innerText = "You have no receipts.";
    }
}

const receiptChangeInput = document.querySelector("#receipt-change-input");

receiptChangeInput.addEventListener("input", (e) => {
    let i = parseInt(e.target.value);
    if (!i || i === "0" || parseInt(i) < 0) {
        // e.target.value = 1;
        i = 1;
    } else if (i > userAnalytics.receipts.length) {
        e.target.value = userAnalytics.receipts.length;
        i = userAnalytics.receipts.length;
    }
    changeReceiptPDFEvent(i - 1);
});
// changeReceiptPDFEvent(0);

const i = 0;
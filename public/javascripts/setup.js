const csvInput = document.querySelector("#csvInput");

let parsedData;
csvInput.addEventListener("change", function(e) {
    console.log(e.target.files[0]);
    console.log("h");

    Papa.parse(e.target.files[0], {
        complete: function(results) {
            console.log(results);
            parsedData = results.data;
            nextButton.classList.remove("d-none");
        },
    });
});

// --------------------------------------------------
// modify CSVs
// --------------------------------------------------
function createCSVTable() {
    const csvTableBody = document.querySelector("#csvTableBody");
    csvTableBody.innerHTML = "";
    console.log(csvTableBody);
    for (let i = 0; i < parsedData.length; i++) {
        const tr = document.createElement("tr");
        tr.id = `row-${i}`;

        const row = parsedData[i];

        if (row.length > 1) {
            for (let j = 0; j < 4; j++) {
                const cell = row[j] || "";

                const CSVInput = createCSVInput(i, j, cell);

                const td = document.createElement("td");
                td.append(CSVInput);

                tr.append(td);

                csvTableBody.append(tr);
            }
        } else {
            parsedData.splice(i, 1);
        }
    }
}

function modifyCSVEvent(e) {
    const indices = e.target.id.replace("input-", "").split("-");
    const value = e.target.value;

    console.log("hi", indices);
    parsedData[indices[0]][indices[1]] = value;
}

const addRowButton = document.querySelector("#addRow");
addRowButton.addEventListener("click", addRowEvent);

function addRowEvent() {
    const csvTableBody = document.querySelector("#csvTableBody");
    const tr = document.createElement("tr");

    const numRows = 4;

    parsedData.push([]);

    const index = parsedData.length - 1;

    tr.id = `row-${index}`;

    for (let i = 0; i < numRows; i++) {
        const CSVInput = createCSVInput(index, i, "");

        const td = document.createElement("td");
        td.append(CSVInput);

        parsedData[index].push("");
        tr.append(td);
    }

    csvTableBody.append(tr);
}

const removeRowButton = document.querySelector("#removeRow");
removeRowButton.addEventListener("click", removeRowEvent);

function removeRowEvent() {
    const index = parsedData.length - 1;

    console.log(index);
    const rowToRemove = document.querySelector(`#row-${index}`);
    rowToRemove.remove();

    parsedData.pop();
}

function createCSVInput(row, column, value) {
    const CSVInput = document.createElement("input");
    CSVInput.className = "form-control";
    CSVInput.id = `input-${row}-${column}`;
    CSVInput.addEventListener("change", modifyCSVEvent);
    CSVInput.value = value;

    return CSVInput;
}

const searchInput = document.querySelector("#searchCSVRows");

searchInput.addEventListener("input", searchEvent);

function searchEvent(e) {
    const searchTerm = e.target.value;

    console.log(searchTerm);

    if (searchTerm === "") {
        removeAllDNone();
    }

    searchRows(searchTerm);
}

function removeAllDNone() {
    const rows = document.querySelectorAll("tr");
    rows.forEach((row) => {
        row.classList.remove("d-none");
    });
}

function searchRows(searchTerm) {
    const rows = document.querySelectorAll("tbody tr");

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNameInput = row.querySelector("input");

        const name = rowNameInput.value.toLowerCase();

        if (name.includes(searchTerm)) {
            row.classList.remove("d-none");
        } else {
            row.classList.add("d-none");
        }
    }
}

function initializeCustomizationInputs(
    selector,
    properties, // the properties to modify are unique for each input (loop through more than one input)
    objectsToSet,
    eventType,
    optionInformation,
    minValue,
    maxValue,
    multiplier, // the multiplier converts the input value to the proper value to set the property
    customWheelAction,
    names
) {
    const inputs = document.querySelectorAll(`${selector}`); //this make it so I do not repeat code for general customizations versus wheel segments

    for (let i = 0; i < inputs.length; i++) {
        if (optionInformation) {
            addOptionsToSelect(
                inputs[i],
                optionInformation.values,
                optionInformation.defaultValue
            );
        }

        inputs[i].addEventListener(eventType, (e) =>
            customizationInputEvent(
                e,
                properties[i],
                objectsToSet[i],
                minValue,
                maxValue,
                multiplier,
                customWheelAction,
                names[i]
            )
        );
    }
}

// -------------------------------------------------------
// event to change an input to a wheel customization input based on a property
// -------------------------------------------------------

function customizationInputEvent(
    e,
    property,
    objectsToSet,
    minValue,
    maxValue,
    multiplier,
    customWheelAction,
    name
) {
    let value;
    if (e.target.type === "checkbox") {
        value = e.target.checked;
    } else {
        value = e.target.value;
    }

    const isFunctionMax = typeof maxValue === "function";
    const isFunctionMin = typeof minValue === "function";

    console.log("function", isFunctionMax, isFunctionMin);
    if (isFunctionMax && e.target.max !== maxValue()) {
        e.target.max = maxValue();
        console.log(maxValue);
        console.log("max", e.target.max);
    }
    if (isFunctionMin && e.target.min !== minValue()) {
        e.target.min = minValue();
    }

    // console.log(e.target);
    console.log(typeof minValue === "number" && value < minValue, " mm");
    if (typeof minValue === "number" && value < minValue) {
        e.target.value = "";
        value = minValue;
    } else if (isFunctionMin && value < minValue()) {
        const minValueToAssign = minValue();
        e.target.value = minValueToAssign;
        value = minValueToAssign;

        e.target.min = minValue();
    } else if (typeof maxValue === "number" && value > maxValue) {
        e.target.value = maxValue;
        value = maxValue;
    } else if (isFunctionMax && value > maxValue()) {
        const maxValueToAssign = maxValue();
        e.target.value = maxValueToAssign;
        value = maxValueToAssign;
        console.log("max", maxValueToAssign);

        e.target.max = maxValue();
    } else if (value === "" && e.target.type === "number") {
        value = 0;
    }

    // ensure to account for nested objects

    let propertyToSet = property;

    if (typeof multiplier === "number") {
        value *= multiplier; // do not convert earlier, so the minimum and maximum values work
    } else if (typeof multiplier === "function") {
        value *= multiplier();
    }

    // console.log(value);

    let objectName;

    for (let i = 0; i < objectsToSet.length; i++) {
        setPath(objectsToSet[i], propertyToSet, value);
        if (!objectName) {
            console.log(objectName, "name");
            objectName = getNameOfVariable(() => objectsToSet[i]);
        }
    }

    if (customWheelAction) {
        customWheelAction(value, propertyToSet, name);
    }
}

// -------------------------------------------------------
// function to set the path of an object in place (does not create a copy)
// -------------------------------------------------------

function setPath(object, path, value) {
    return path
        .split(".")
        .reduce(
            (o, p, i) => (o[p] = path.split(".").length === ++i ? value : o[p] || {}),
            object
        );
}

// -------------------------------------------------------
// function to get the path of an object
// -------------------------------------------------------

function getPath(path, obj = self, separator = ".") {
    var properties = Array.isArray(path) ? path : path.split(separator);
    return properties.reduce((prev, curr) => prev && prev[curr], obj);
}

function addOptionsToSelect(select, options, defaultOption) {
    // console.log(options);
    options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.text = option;

        optionElement.value = option;

        if (option === defaultOption) {
            optionElement.selected = true;
        }
        select.append(optionElement);
    });
}

const productsPDFs = new jspdf.jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    floatPrecision: "smart",
});

const sectionsPDFs = new jspdf.jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    floatPrecision: "smart",
});

let widthMargin = (sectionsPDFs.internal.pageSize.getWidth() - 10) / 2;
let heightMargin = (sectionsPDFs.internal.pageSize.getHeight() - 10) / 2;

// scale the canvas accordingly

function makeDataURLFromImage(image) {
    const canvas = document.createElement("canvas");

    const imageToConvert = new Image();
    imageToConvert.src = image;

    canvas.width = imageToConvert.width;
    canvas.height = imageToConvert.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageToConvert, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
}

const dataURL = makeDataURLFromImage("/images/QR_test.png");

console.log(dataURL, "data");
const productPDFEmbed = document.querySelector("#productPDFEmbed");

const sectionPDFEmbed = document.querySelector("#sectionPDFEmbed");

let valueRatio = 10;

const productPDFCustomizations = {
    orientation: "p",
    unit: "mm",
    format: "a4",
    floatPrecision: "smart",
    value: 5,
};
const sectionPDFCustomizations = {
    orientation: "p",
    unit: "mm",
    format: "a4",
    floatPrecision: "smart",
    value: 5,
};

const customizationsPDFs = {
    productPDFCustomizations,
    sectionPDFCustomizations,
};

const objectsToSet = [
    [productsPDFs, customizationsPDFs.productPDFCustomizations],
    [sectionsPDFs, customizationsPDFs.sectionPDFCustomizations],
];
const names = ["productsPDFs", "sectionsPDFs"];

const units = ["in", "mm", "cm", "pt", "pc", "px"];
const unitOptions = {
    values: units,
    defaultValue: "pt",
};
initializeCustomizationInputs(
    ".PDFUnits", ["unit", "unit"],
    objectsToSet,
    "change",
    unitOptions,
    null,
    null,
    null,
    imageScaleCallback,
    names
);

const formats = ["a4", "a3", "a2", "a1", "letter", "legal"];
const formatOptions = {
    values: formats,
    defaultValue: "a4",
};
initializeCustomizationInputs(
    ".PDFFormat", ["format", "format"],
    objectsToSet,
    "change",
    formatOptions,
    null,
    null,
    null,
    imageScaleCallback,
    names
);

function imageScaleCallback(value, property, objectName) {
    if (objectName.includes("product")) {
        setImageScale(
            value,
            productsPDFs,
            customizationsPDFs.productPDFCustomizations
        );
    } else {
        setImageScale(
            value,
            sectionsPDFs,
            customizationsPDFs.sectionPDFCustomizations
        );
    }
}

initializeCustomizationInputs(
    ".PDFImageSize", ["imageSize", "imageSize"], [objectsToSet[0][1], objectsToSet[1][1]],
    "input",
    null,
    0,
    null,
    null,
    imageScaleCallback,
    names
);

function setImageScale(value, pdf, customization) {
    let width = pdf.internal.pageSize.getWidth();
    let height = pdf.internal.pageSize.getHeight();

    const smallerDirection = height > width ? width : height;

    const parsedValue =
        parseInt(value) > smallerDirection ? smallerDirection : parseInt(value);

    console.log(parsedValue, "parsedValue");
    pdf.value = parseInt(parsedValue);
    customization.value = parseInt(parsedValue);

    // pdf.addImage(
    //     canvas.toDataURL("image/jpeg", 1.0),
    //     "JPEG",
    //     0,
    //     0,
    //     canvas.width * ratio,
    //     canvas.height * ratio
    // );
}

function addImage(image) {
    pdf.addImage(image, "JPEG", 0, 0, valueRatio, valueRatio);
}

function getNameOfVariable(f) {
    f.toString().replace(/[ |\(\)=>]/g, "");
}

const previousButton = document.querySelector("a[href='#previous']");
const nextButton = document.querySelector("a[href='#next']");

nextButton.addEventListener("click", changeTabEvent);
previousButton.addEventListener("click", changeTabEvent);

nextButton.classList.add("d-none");

const finishButton = document.querySelector("a[href='#finish']");
finishButton.remove();

const finishText = document.querySelector("#finishText");
async function changeTabEvent() {
    const currentTab = document.querySelector(".body.current .row");
    const currentTabId = currentTab.id;

    console.log(currentTabId);
    if (currentTabId === "addCSVFile") {
        if (!parsedData) {
            nextButton.classList.add("d-none");
        }
    } else if (currentTabId === "editCSV") {
        createCSVTable();
    } else if (currentTabId === "finish") {
        const data = await pushToDatabase();
        console.log(data, "data");

        const productNumPages = productsPDFs.internal.getNumberOfPages();
        for (let i = 1; i < productNumPages; i++) {
            productsPDFs.deletePage(1);
        }

        const sectionNumPages = sectionsPDFs.deletePage(
            sectionsPDFs.getNumberOfPages
        );
        for (let i = 1; i < sectionNumPages; i++) {
            sectionsPDFs.deletePage(1);
        }

        await addImages(
            data.products,
            productsPDFs,
            parseInt(customizationsPDFs.productPDFCustomizations.value),
            true
        );

        const sections = makeSectionsArray(parsedData);
        await addImages(
            data.sections,
            sectionsPDFs,
            customizationsPDFs.sectionPDFCustomizations.value,
            false
        );

        productsPDFs.save("products.pdf");
        sectionsPDFs.save("sections.pdf");

        finishText.innerHTML = "PDFs Downloaded!";
    } else {
        nextButton.classList.remove("d-none");
        finishText.innerHTML = "PDFs Downloading...";
    }
}

async function addImages(data, pdf, value, isProduct) {
    console.log(data, "data");
    if (data.length === 0) {
        pdf.text("Please define products with sections to see QRs.", 10, 10);
        return;
    }
    for (let i = 0; i < data.length; i++) {
        // console.log(data[i]);
        const qrCode = await QRCode.toDataURL(
            `${data[i]._id}.${isProduct ? "product" : "section"}`
        ); // will ultimately make the codes with product ids

        pdf.text(data[i].name, 10, 10);

        let width = pdf.internal.pageSize.getWidth();
        let height = pdf.internal.pageSize.getHeight();

        const marginWidth = (width - value || 5) / 2;
        const marginHeight = (height - value || 5) / 2;

        pdf.addImage(
            qrCode,
            "PNG",
            marginWidth,
            marginHeight,
            parseInt(value || 5),
            parseInt(value || 5)
        );
        console.log(marginWidth, marginHeight, value);
        pdf.addPage();
    }
}

async function pushToDatabase() {
    try {
        const products = convertMultiArrayToObjects(parsedData, [
            "name",
            "price",
            "section",
            "description",
        ]);

        const response = await axios.post("/companies/setup", {
            products,
        });

        return {
            products: response.data.products,
            sections: response.data.sections,
        };
    } catch (e) {}
}

function makeSectionsArray(arr) {
    const sections = [];
    for (let i = 0; i < arr.length; i++) {
        const section = sections.find((element) => element.name === arr[i][2]);

        let product = [];

        product.push(...arr[i].slice(0, 2), arr[i][3]);
        console.log(product);

        product = convertArrayToObject(product, ["name", "price", "description"]);
        if (section) {
            section.products.push(product);
        } else if (arr[i][2]) {
            sections.push({
                name: arr[i][2],
                products: [product],
            });
        }
    }
    return sections;
}

function convertArrayToObject(arr, properties) {
    const obj = {};
    for (let i = 0; i < properties.length; i++) {
        obj[properties[i]] = arr[i];
    }
    return obj;
}

function convertMultiArrayToObjects(arr, properties) {
    const newArr = [];

    for (let i = 0; i < arr.length; i++) {
        const obj = {};
        for (let j = 0; j < properties.length; j++) {
            if (properties[j] === "price") {
                obj[properties[j]] = parseInt(arr[i][j]) || 0;
            } else {
                obj[properties[j]] = arr[i][j];
            }
        }
        newArr.push(obj);
    }
    return newArr;
}
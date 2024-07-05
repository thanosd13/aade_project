const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");
const imagePath = path.join(__dirname, "Pngtree_wolf logo_2306634.png");
const fontPath = path.join(
  __dirname,
  "../../assets/fonts/OpenSans-Regular.ttf"
);
const fontPathBold = path.join(
  __dirname,
  "../../assets/fonts/OpenSans-Bold.ttf"
);
const fontPathItalic = path.join(
  __dirname,
  "../../assets/fonts/OpenSans-Italic.ttf"
);

const paymentWayMapping = {
  1: "Μετρητά",
  2: "Web banking",
  3: "Pos/e-Pos",
  4: "Επιταγή",
};

const invoiceTypeMapping = {
  1: "Τιμολόγιο πώλησης",
  2: "Απόδειξη",
};

function createInvoice(invoice, callback) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });

  generateHeader(doc, invoice);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc, invoice); // Add the footer with "Παρατηρήσεις"

  // Collect PDF data into a buffer
  let buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {
    let pdfData = Buffer.concat(buffers);
    console.log(`Generated PDF Size: ${pdfData.length} bytes`); // Log PDF size
    callback(pdfData);
  });

  doc.end();
}

function generateHeader(doc, invoice, size = 7) {
  try {
    const logoImage = Buffer.from(invoice.pdfTemplateData.logoImage);

    // Add the image to the document
    doc.image(logoImage, 50, 45, {
      width: invoice.pdfTemplateData.logoSize * 6,
      height: invoice.pdfTemplateData.logoSize * 6,
    });
  } catch (error) {
    console.error("Error processing logo image:", error);
  }

  doc
    .fillColor(invoice.pdfTemplateData.firstColor)
    .font(fontPathBold)
    .fontSize(invoice.pdfTemplateData.textSize)
    .text(invoice.userData.name, 200, 50, { align: "right" })
    .text(
      invoice.userData.address + " " + invoice.userData.street_number,
      200,
      65,
      { align: "right" }
    )
    .text(
      "ΑΦΜ: " + invoice.userData.afm + ", " + "ΔΟΥ: " + invoice.userData.doy,
      200,
      80,
      { align: "right" }
    )
    .text(
      "ΤΗΛ: " +
        invoice.userData.tel_number +
        ", " +
        "EMAIL: " +
        invoice.userData.email,
      200,
      95,
      { align: "right" }
    )
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor(invoice.pdfTemplateData.firstColor)
    .fontSize(15)
    .font(fontPathBold)
    .text(getInvoiceTypeText(invoice.informations.invoice_type), 50, 160)
    .fontSize(14)
    .fillColor("#444444")
    .font(fontPathItalic)
    .text(getCurrentDateFormatted(invoice.customerData.date), 50, 165, {
      align: "right",
    });

  generateHr(doc, 550, 185);

  const customerInformationTop = 200;

  doc
    .fillColor(invoice.pdfTemplateData.secondColor)
    .fontSize(9)
    .font(fontPath)
    .text("Επωνυμία:", 50, customerInformationTop)
    .fontSize(9)
    .text(
      getFirstThreeWords(invoice.customerData.name),
      150,
      customerInformationTop
    ) // Corrected text
    .fontSize(9)
    .font(fontPath)
    .fontSize(9)
    .text("ΑΦΜ:", 50, customerInformationTop + 15)
    .fontSize(9)
    .text(invoice.customerData.afm, 150, customerInformationTop + 15) // Corrected text
    .fontSize(9)
    .text("Επάγγελμα:", 50, customerInformationTop + 30)
    .fontSize(9)
    .text(
      getFirstThreeWords(invoice.customerData.work),
      150,
      customerInformationTop + 30
    )
    .fontSize(9)
    .text("ΔΟΥ:", 50, customerInformationTop + 45)
    .fontSize(9)
    .text(invoice.customerData.doy, 150, customerInformationTop + 45) // Corrected text
    .fontSize(9)
    .text("Χώρα:", 300, customerInformationTop)
    .fontSize(9)
    .text(invoice.customerData.country, 350, customerInformationTop) // Corrected text
    .font(fontPath)
    .fontSize(9)
    .text("Πόλη:", 300, customerInformationTop + 15)
    .fontSize(9)
    .text(invoice.customerData.city, 350, customerInformationTop + 15) // Corrected text
    .fontSize(9)
    .text("Διεύθυνση:", 300, customerInformationTop + 30)
    .fontSize(9)
    .text(
      invoice.customerData.address + " " + invoice.customerData.street_number,
      350,
      customerInformationTop + 30
    ) // Corrected text
    .fontSize(9)
    .text("Τρόπος πληρωμής: ", 300, customerInformationTop + 45)
    .fontSize(9)
    .text(
      " " + getPaymentWayText(invoice.informations.payment_way),
      380,
      customerInformationTop + 45
    ) // Sample text
    .moveDown();

  generateHr(doc, 550, 264);
}

function generateInvoiceTable(doc, invoice) {
  console.log("Generating invoice table");
  let i;
  const invoiceTableTop = 330;
  doc.font(fontPathBold).fillColor(invoice.pdfTemplateData.firstColor);
  generateTableRow(
    doc,
    invoiceTableTop,
    "Προϊόν",
    "Ποσότητα",
    "Μ.Μ",
    "Τιμή προ ΦΠΑ",
    "ΦΠΑ",
    "Τελική τιμή"
  );
  generateHr(doc, 570, invoiceTableTop + 20);
  doc.font(fontPath);

  let totalPrice = 0;
  let totalFinalPrice = 0;
  let totalFpa = 0;

  for (i = 0; i < invoice.products.products.length; i++) {
    const item = invoice.products.products[i];
    const position = invoiceTableTop + (i + 1) * 30;
    doc.fillColor(invoice.pdfTemplateData.secondColor);
    generateTableRow(
      doc,
      position,
      item.name,
      "2",
      item.type,
      item.price,
      item.fpa,
      item.final_price
    );

    totalPrice += parseFloat(item.price);
    totalFinalPrice += parseFloat(item.final_price);
    totalFpa += parseFloat(item.final_price - item.price);

    generateHr(doc, 570, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  doc.fillColor("#444444");
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Καθαρή αξία:",
    "",
    totalPrice + "€"
  );

  const paidToDatePosition = subtotalPosition + 20;
  generateTableRow(doc, paidToDatePosition, "", "", "Έκπτωση:", "", "0,00€");

  const duePosition = paidToDatePosition + 25;
  doc.font(fontPath);
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "Σύνολο ΦΠΑ:",
    "",
    totalFpa.toFixed(2) + "€"
  );
  doc.font(fontPathBold);
  const totalAmount = duePosition + 30;
  generateTableRow(
    doc,
    totalAmount,
    "",
    "",
    "Σύνολο:",
    "",
    totalFinalPrice.toFixed(2) + "€"
  );
  doc.font(fontPath);
}

function generateFooter(doc, invoice) {
  const footerPosition = 720;

  // Draw a rectangle (text area border)
  doc
    .roundedRect(50, footerPosition - 10, 250, 80, 3)
    .strokeColor("#444444")
    .lineWidth(1)
    .stroke();

  doc.font(fontPath).fontSize(10).fillColor("#000000");

  doc
    .font(fontPath)
    .fontSize(9)
    .fillColor("#444444")
    .text(invoice.pdfTemplateData.notes, 55, footerPosition + 2, {
      width: 490,
      height: 60,
    });
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal,
  finalPrice
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 230, y, { width: 90, align: "center" })
    .text(quantity, 320, y, { width: 90, align: "center" })
    .text(lineTotal, 400, y, { width: 90, align: "center" })
    .text(finalPrice, 490, y, { width: 90, align: "center" }); // Render the new parameter
}

function generateHr(doc, x, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(x, y).stroke();
}

function formatCurrency(cents) {
  return "$" + (cents / 100).toFixed(2);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

function getCurrentDateFormatted(requestDate) {
  // Parse the date string into a Date object
  const date = new Date(requestDate);

  // Extract day, month, and year
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // January is 0
  const year = date.getFullYear();

  // Format the date as "DD/MM/YYYY"
  return `${day}/${month}/${year}`;
}

function getFirstThreeWords(str) {
  return str.split(" ").slice(0, 2).join(" ");
}

function getPaymentWayText(value) {
  return paymentWayMapping[value] || "Άγνωστος τρόπος πληρωμής";
}

function getInvoiceTypeText(value) {
  return invoiceTypeMapping[value] || "";
}

module.exports = {
  createInvoice,
};

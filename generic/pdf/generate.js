const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");
const imagePath = path.join(__dirname, 'Pngtree_wolf logo_2306634.png');
const fontPath = path.join(__dirname, '../../assets/fonts/OpenSans-Regular.ttf'); 
const fontPathBold = path.join(__dirname, '../../assets/fonts/OpenSans-Bold.ttf'); 
const fontPathItalic = path.join(__dirname, '../../assets/fonts/OpenSans-Italic.ttf'); 

function createInvoice(invoice, callback) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });
  console.log('Starting PDF Generation');
  generateHeader(doc, invoice);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);

  // Collect PDF data into a buffer
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
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
    doc.image(logoImage, 50, 45, { width: 50 });
  } catch (error) {
    console.error('Error processing logo image:', error);
  }

  doc
    .fillColor("#444444")
    .font(fontPathBold)
    .fontSize(size)
    .text(invoice.userData.name, 200, 50, { align: "right" })
    .text(invoice.userData.address + " " + invoice.userData.street_number, 200, 65, { align: "right" })
    .text("ΑΦΜ: " + invoice.userData.afm + ", " + "ΔΟΥ: " + invoice.userData.doy, 200, 80, { align: "right" })
    .text("ΤΗΛ: " + invoice.userData.tel_number + ", " + "EMAIL: " + invoice.userData.email, 200, 95, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor("#444444")
    .fontSize(15)
    .font(fontPathBold)
    .text("Τιμολόγιο", 50, 160)
    .fontSize(14)
    .font(fontPathItalic)
    .text(getCurrentDateFormatted(), 50, 165, { align: "right" });

  generateHr(doc, 550, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(9)
    .font(fontPath)
    .text("Επωνυμία:", 50, customerInformationTop)
    .fontSize(9)
    .text(getFirstThreeWords(invoice.customerData.name), 150, customerInformationTop) // Corrected text
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
    .text(
      "ΔΟΥ:",
      50,
      customerInformationTop + 45
    )
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
    .text(
      "Διεύθυνση:",  
      300,
      customerInformationTop + 30
    )
    .fontSize(9)
    .text(invoice.customerData.address + " " + invoice.customerData.street_number, 350, customerInformationTop + 30) // Corrected text
    .fontSize(9)
    .text(
      "Τρόπος πληρωμής: ",  
      300,
      customerInformationTop + 45
    )
    .fontSize(9)
    .text(" Μετρητά", 380, customerInformationTop + 45) // Sample text
    .moveDown();

  generateHr(doc, 550, 264);
}

function generateInvoiceTable(doc, invoice) {
  console.log('Generating invoice table');
  let i;
  const invoiceTableTop = 330;
  doc.font(fontPathBold)
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

  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.item,
      item.quantity,
      "τεμ.",
      "200€",
      "24%",
      "300€",
    );

    generateHr(doc, 570, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Καθαρή αξία:",
    "",
    "200,00€"
  );

  const paidToDatePosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    paidToDatePosition,
    "",
    "",
    "Έκπτωση:",
    "",
    "0,00€"
  );

  const duePosition = paidToDatePosition + 25;
  doc.font(fontPath);
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "Σύνολο ΦΠΑ:",
    "",
    "24%"
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
    "400,00€"
  );  
  doc.font(fontPath);
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal,
  finalPrice // Add the new parameter here
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
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(x, y)
    .stroke();
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

function getCurrentDateFormatted() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function getFirstThreeWords(str) {
  return str.split(' ').slice(0, 2).join(' ');
}

module.exports = {
  createInvoice
};

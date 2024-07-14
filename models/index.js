const db = require("../config/database");
const userModel = require("./userModel");
const customerModel = require("./customerModel");
const productModel = require("./productModel");
const userDataModel = require("./userDataModel");
const pdfTemplateDataModel = require("./pdfTemplateModel");
const invoiceModel = require("./invoiceModel");
const invoicePdfModel = require("./invoicePdfModel");
const aadeDataModel = require("./aadeDataModel");
const myDataNewInvoiceModel = require("./myDataNewInvoiceModel");
const model = {};

db.authenticate()
  .then(() =>
    console.log("Database connection has been established successfully.")
  )
  .catch((err) => console.error("Unable to connect to the database:", err));

userModel.hasMany(customerModel, { foreignKey: "userId" });
customerModel.belongsTo(userModel, { foreignKey: "userId" });

userModel.hasOne(productModel, { foreignKey: "userId" });
productModel.belongsTo(userModel, { foreignKey: "userId" });

userModel.hasOne(userDataModel, { foreignKey: "userId" });
userDataModel.belongsTo(userModel, { foreignKey: "userId" });

userModel.hasOne(userDataModel, { foreignKey: "userId" });
pdfTemplateDataModel.belongsTo(userModel, { foreignKey: "userId" });

userModel.hasMany(invoiceModel, { foreignKey: "userId" });
invoiceModel.belongsTo(userModel, { foreignKey: "userId" });

invoiceModel.hasOne(invoicePdfModel, { foreignKey: "invoice_id" });
invoicePdfModel.belongsTo(invoiceModel, { foreignKey: "invoice_id" });

userModel.hasMany(myDataNewInvoiceModel, { foreignKey: "userId" });
myDataNewInvoiceModel.belongsTo(userModel, { foreignKey: "userId" });

invoiceModel.hasOne(myDataNewInvoiceModel, { foreignKey: "invoice_id" });
myDataNewInvoiceModel.belongsTo(invoiceModel, { foreignKey: "invoice_id" });

userModel.hasOne(aadeDataModel, { foreignKey: "userId" });
aadeDataModel.belongsTo(userModel, { foreignKey: "userId" });

db.sync()
  .then(() =>
    console.log(
      "User table has been successfully created or updated, if it does not exist or needs alteration"
    )
  )
  .catch((error) => console.error("This error occurred:", error));

model.user = userModel;
model.customer = customerModel;
model.product = productModel;
model.userData = userDataModel;
model.pdfData = pdfTemplateDataModel;
model.invoice = invoiceModel;
model.invoicePdf = invoicePdfModel;
model.aadeData = aadeDataModel;
model.myDataNewInvoice = myDataNewInvoiceModel;
module.exports = model;

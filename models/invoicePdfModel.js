const sequelize = require("sequelize");
const db = require("../config/database");
const model = require("./index");

const InvoicePdfModel = db.define(
  "InvoicePdfModel",
  {
    id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    invoice_id: {
      type: sequelize.INTEGER,
      references: {
        model: model.invoice,
        key: "id",
      },
    },
    pdf_data: { type: sequelize.BLOB("long") },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = InvoicePdfModel;

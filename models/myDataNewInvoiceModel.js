const sequelize = require("sequelize");
const db = require("../config/database");
const model = require("./index");

var myDataNewInvoiceModel = db.define(
  "myDataNewInvoice",
  {
    id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    invoice_uid: { type: sequelize.STRING },
    invoice_mark: { type: sequelize.STRING },
    qr_url: { type: sequelize.STRING },
    invoice_id: {
      type: sequelize.INTEGER,
      references: {
        model: model.invoice,
        key: "id",
      },
    },
    userId: {
      type: sequelize.INTEGER,
      allowNull: false,
      references: { model: "user", key: "id" },
    },
  },
  {
    // freeze name table not using *s on name
    freezeTableName: true,
    // dont use createdAt/update
    timestamps: false,
  }
);
module.exports = myDataNewInvoiceModel;

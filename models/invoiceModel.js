const sequelize = require("sequelize");
const db = require("../config/database");
var invoice = db.define(
  "invoice",
  {
    id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    cutsomer_name: { type: sequelize.STRING },
    published_date: { type: sequelize.STRING },
    afm: { type: sequelize.STRING },
    invoice_type: { type: sequelize.STRING },
    price: { type: sequelize.STRING },
    fpa: { type: sequelize.STRING },
    total_price: { type: sequelize.STRING },
    my_data_code: { type: sequelize.STRING },
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
module.exports = invoice;

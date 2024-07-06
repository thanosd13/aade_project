const sequelize = require("sequelize");
const db = require("../config/database");
var aadeDataModel = db.define(
  "aadeDataModel",
  {
    id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: sequelize.STRING, allowNull: true },
    subscription_key: { type: sequelize.STRING, allowNull: true },
    userId: {
      type: sequelize.INTEGER,
      allowNull: false,
      references: { model: "user", key: "id" },
      unique: true,
    },
  },
  {
    // freeze name table not using *s on name
    freezeTableName: true,
    // dont use createdAt/update
    timestamps: false,
  }
);
module.exports = aadeDataModel;

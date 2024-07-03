const sequelize = require("sequelize");
const db = require("../config/database");
var pdfTemplateDataModel = db.define(
    "pdfTemplateData",
    {
        id: { type: sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        logoImage: { type: sequelize.BLOB, allowNull: true },
        firstColor: { type: sequelize.STRING, allowNull:true },
        secondColor: { type: sequelize.STRING, allowNull:true },
        textSize: { type: sequelize.STRING, allowNull: true },
        userId: { type: sequelize.INTEGER, allowNull: false, references: { model: 'user', key: 'id' } }
    },
    {
        // freeze name table not using *s on name
        freezeTableName: true,
        // dont use createdAt/update
        timestamps: false,
    }
);
module.exports = pdfTemplateDataModel;
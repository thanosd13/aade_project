const sequelize = require("sequelize");
const db = require("../config/database");
var product = db.define(
    "product",
    {
        id: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: sequelize.STRING,
            allowNull: false
        },
        price: {
            type: sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        type: {
            type: sequelize.STRING
        },
        fpa: {
            type: sequelize.STRING
        },
        final_price: {
            type: sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        userId: { 
            type: sequelize.INTEGER, 
            allowNull: false, 
            references: { model: 'user', key: 'id' } 
        }
    },
    {
        // freeze name table not using *s on name
        freezeTableName: true,
        // dont use createdAt/update
        timestamps: false,
    }
);
module.exports = product;
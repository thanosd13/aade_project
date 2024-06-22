const sequelize = require("sequelize");
const db = require("../config/database");
var customer = db.define(
    "customer",
    {
        id: { type: sequelize.INTEGER, primaryKey: true },
        afm: {
            type: sequelize.STRING,
            allowNull: false,  // Ensures AFM cannot be null
            unique: true,      // Ensures each AFM is unique
            validate: {
                notEmpty: { msg: "AFM must not be empty" }  // Ensures AFM is not an empty string
            }
        },
        name: { type: sequelize.STRING },
        country: { type: sequelize.STRING },
        city: { type: sequelize.STRING },
        address: { type: sequelize.STRING },
        street_number: { type: sequelize.STRING },
        postal_code: {type: sequelize.STRING},
        doy: { type: sequelize.STRING },
        work: { type: sequelize.STRING },
        email: { type: sequelize.STRING },
        tel_number:  { type: sequelize.STRING },
        userId: { type: sequelize.INTEGER, allowNull: false, references: { model: 'user', key: 'id' } }
    },
    {
        // freeze name table not using *s on name
        freezeTableName: true,
        // dont use createdAt/update
        timestamps: false,
    }
);
module.exports = customer;
const sequelize = require("sequelize");
const db = require("../config/database");
var user = db.define(
    "user",
    {
        id: { type: sequelize.INTEGER, primaryKey: true },
        username: { type: sequelize.STRING, unique: true },
        password: { type: sequelize.STRING },
        role: { type: sequelize.ENUM, values: ['user', 'admin'] },
        username_aade: { type: sequelize.STRING },
        subscription_key_aade: {type: sequelize.STRING},
    },
    {
        // freeze name table not using *s on name
        freezeTableName: true,
        // dont use createdAt/update
        timestamps: false,
    }
);
module.exports = user;
const userController = require("./userController");
const customerController = require("./customerController");
var controllers = {};
controllers.user = userController;
controllers.customer = customerController;
module.exports = controllers;
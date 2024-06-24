const userController = require("./userController");
const customerController = require("./customerController");
const productController = require("./productController");
var controllers = {};
controllers.user = userController;
controllers.customer = customerController;
controllers.product = productController;
module.exports = controllers;
const express = require("express");
const router = express.Router();
const controller = require("../controllers/indexController");
router.post("/create/:userId", controller.customer.createCustomer);
router.put("/:id", controller.customer.updateCustomer);
router.get("/getDataByAfm/:afm", controller.customer.getDataByAfm);
router.get("/getCustomers/:userId", controller.customer.getCustomersByUserId);
router.delete("/:userId/:id", controller.customer.deleteCustomer);
module.exports = router;
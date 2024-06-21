const express = require("express");
const router = express.Router();
const controller = require("../controllers/indexController");
router.post("/create/:userId", controller.customer.createCustomer);
router.get("/getDataByAfm/:afm", controller.customer.getDataByAfm);
module.exports = router;
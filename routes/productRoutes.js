const express = require("express");
const router = express.Router();
const controller = require("../controllers/indexController");
router.get("/:userId", controller.product.getProducts);
router.post("/create/:userId", controller.product.createProduct);
router.put("/:id", controller.product.updateProduct);
router.delete("/:id", controller.product.deleteProduct);
module.exports = router;
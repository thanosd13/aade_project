const express = require("express");
const router = express.Router();
const controller = require("../controllers/indexController");
router.post("/:id",controller.pdfController.insertPdfTemplateData);
module.exports = router;
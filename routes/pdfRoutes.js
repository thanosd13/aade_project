const express = require("express");
const router = express.Router();
const controller = require("../controllers/indexController");
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/:id", upload.single('logoImage'), controller.pdfController.insertPdfTemplateData);
router.put("/:id", upload.single('logoImage'), controller.pdfController.updatePdfTemplateData);
router.get("/:id", controller.pdfController.getPdfTemplateDataByUserId);
router.get("/image/:id", controller.pdfController.getImageByUserId);

module.exports = router;

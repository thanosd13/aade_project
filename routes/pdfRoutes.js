const express = require("express");
const router = express.Router();
const controller = require("../controllers/indexController");
const multer = require("multer");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/:id",
  upload.single("logoImage"),
  controller.pdfController.insertPdfTemplateData
);
router.post("/create/:id", controller.pdfController.createInvoice);
router.post(
  "/getMaxSerialNumber/:id",
  controller.pdfController.getMaxSerialNumberBySerieAndUserId
);
router.put(
  "/:id",
  upload.single("logoImage"),
  controller.pdfController.updatePdfTemplateData
);
router.get("/:id", controller.pdfController.getPdfTemplateDataByUserId);
router.get("/image/:id", controller.pdfController.getImageByUserId);
router.get("/invoices/:id", controller.pdfController.getAllInvoicesByUserId);
router.get("/series/:id", controller.pdfController.getInvoiceSeriesByUserId);
router.get("/getMarks/:id", controller.pdfController.getAllMarksByUserId);
router.get(
  "/getCustomerByMark/:mark",
  controller.pdfController.getAfmByInvoiceMark
);
router.get(
  "/document/:id/:documentId",
  controller.pdfController.getPdfByInvoiceId
);

module.exports = router;

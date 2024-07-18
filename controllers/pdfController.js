const sequelize = require("sequelize"); // Import Sequelize
const model = require("../models/index");
const { createInvoice } = require("../generic/pdf/generate");
const { cancelInvoice } = require("../services/cancelInvoiceService");
const { sendInvoice } = require("../services/sendInvoiceService");
const { generateQrCode } = require("../generic/generateQrCode");

const controller = {};

controller.insertPdfTemplateData = async function (req, res) {
  try {
    const logoImage = req.file ? req.file.buffer : null;
    const newPdfTemplateData = await model.pdfData.create({
      logoImage: logoImage,
      firstColor: req.body.firstColor,
      secondColor: req.body.secondColor,
      textSize: req.body.textSize,
      logoSize: req.body.logoSize,
      notes: req.body.notes[0],
      userId: req.params.id,
    });
    return res
      .status(201)
      .json({ message: "success", data: newPdfTemplateData });
  } catch (error) {
    return res
      .status(400)
      .send({ error: "Error creating data: " + error.message });
  }
};

controller.updatePdfTemplateData = async function (req, res) {
  try {
    const existingData = await model.pdfData.findOne({
      where: { userId: req.params.id },
    });

    if (!existingData) {
      return res.status(404).json({ error: "No data found for the user" });
    }
    console.log(req.body);
    const logoImage = req.file ? req.file.buffer : existingData.logoImage;
    const updatedPdfTemplateData = await model.pdfData.update(
      {
        logoImage: logoImage,
        firstColor: req.body.firstColor,
        secondColor: req.body.secondColor,
        textSize: req.body.textSize,
        logoSize: req.body.logoSize,
        notes: req.body.notes,
      },
      {
        where: { userId: req.params.id },
      }
    );

    return res
      .status(200)
      .json({ message: "success", data: updatedPdfTemplateData });
  } catch (error) {
    return res
      .status(400)
      .send({ error: "Error updating data: " + error.message });
  }
};

controller.getPdfTemplateDataByUserId = async function (req, res) {
  try {
    const pdfTemplateData = await model.pdfData.findOne({
      where: { userId: req.params.id },
    });
    if (!pdfTemplateData) {
      return res.status(404).json({ error: "No data found" });
    }
    return res.status(200).json(pdfTemplateData);
  } catch (error) {
    return res
      .status(400)
      .send({ error: "Error fetching data: " + error.message });
  }
};

controller.getImageByUserId = async function (req, res) {
  try {
    const pdfTemplateData = await model.pdfData.findOne({
      attributes: ["logoImage"],
      where: { userId: req.params.id },
    });
    if (!pdfTemplateData || !pdfTemplateData.logoImage) {
      return res.status(404).json({ error: "No image found" });
    }

    res.set("Content-Type", "image/png"); // Set appropriate content type
    return res.send(pdfTemplateData.logoImage);
  } catch (error) {
    return res
      .status(400)
      .send({ error: "Error fetching image: " + error.message });
  }
};

controller.createInvoice = async function (req, res) {
  const userId = req.params.id;
  const customerData = req.body.formData.customerData;
  const products = req.body.formData.products;
  const informations = req.body.formData.informations;
  const only_view = req.body.formData.only_view;

  let totalPrice = 0;
  let totalFinalPrice = 0;
  let totalFpa = 0;

  for (var i in products) {
    totalPrice += parseFloat(products[i].price);
    totalFinalPrice += parseFloat(products[i].final_price);
    totalFpa += parseFloat(products[i].final_price - products[i].price);
  }
  try {
    const userData = await model.userData.findAll({
      where: { userId: userId },
    });
    if (userData.length < 1) {
      return res.status(404).send({ error: "User data not found" });
    }

    const pdfTemplateData = await model.pdfData.findOne({
      where: { userId: req.params.id },
    });

    const newInvoice = await model.invoice.create({
      cutsomer_name: customerData.name,
      published_date: informations.date,
      afm: customerData.afm,
      invoice_type: informations.invoice_type,
      price: totalPrice.toFixed(2),
      fpa: totalFpa.toFixed(2),
      total_price: totalFinalPrice.toFixed(2),
      my_data_code: informations.my_data,
      invoice_serie: informations.invoice_serie,
      serial_number: informations.serial_number,
      userId: userId,
    });

    let qrCodePng;
    if (informations.my_data) {
      const sendInvoiceResponse = await sendInvoice(
        newInvoice.id,
        userId,
        userData[0].afm,
        informations.invoice_serie,
        informations.serial_number,
        customerData,
        products,
        informations.invoice_type,
        informations.invoice_mark,
        informations.date
      );

      // Generate the QR code PNG
      qrCodePng = await generateQrCode(
        sendInvoiceResponse.data.dataValues.qr_url
      );
    }

    const invoice = {
      userData: userData[0].dataValues,
      pdfTemplateData: pdfTemplateData.dataValues,
      customerData: {
        ...customerData,
      },
      products: {
        products,
      },
      informations: informations,
      qrCodePng, // Include the QR code PNG buffer
    };

    createInvoice(invoice, async (pdfData) => {
      if (!only_view) {
        try {
          await model.invoicePdf.create({
            invoice_id: newInvoice.id,
            pdf_data: pdfData,
            qr_code_png: qrCodePng, // Store the QR code PNG if needed
          });

          res.setHeader(
            "Content-Disposition",
            "attachment; filename=invoice.pdf"
          );
          res.setHeader("Content-Type", "application/pdf");
          return res.status(201).send(pdfData);
        } catch (error) {
          return res.status(400).send({
            error: "Error creating invoice and PDF: " + error.message,
          });
        }
      } else {
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=invoice.pdf"
        );
        res.setHeader("Content-Type", "application/pdf");
        return res.status(201).send(pdfData);
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating invoice", error: error.message });
  }
};

controller.cancelInvoice = async function (req, res) {
  try {
    const response = await cancelInvoice(req.params.id, req.params.mark);
    return res.status(response.status).json({ data: response });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error cancel invoice", error: error.message });
  }
};

controller.getAllInvoicesByUserId = async function (req, res) {
  try {
    const invoices = await model.invoice.findAll({
      where: { userId: req.params.id },
      include: [
        {
          model: model.myDataNewInvoice,
          attributes: ["invoice_mark"], // Include only the invoice_mark field from myDataNewInvoiceModel
        },
      ],
    });

    // Set headers for PDF download
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.setHeader("Content-Type", "application/pdf");

    // Return the invoices in the response
    res.status(200).json(invoices);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching invoices", error: error.message });
  }
};

controller.getMaxSerialNumberBySerieAndUserId = async function (req, res) {
  try {
    // Find all serial_numbers for the given invoice_serie and userId
    const invoices = await model.invoice.findAll({
      attributes: ["serial_number"],
      where: {
        invoice_serie: req.body.serie,
        userId: req.params.id,
      },
    });

    // Check if invoices are found
    if (!invoices || invoices.length === 0) {
      return res.status(200).json({
        message: "No serial numbers found for the given serie and userId",
      });
    }

    // Find the maximum serial number from the fetched records
    const maxSerialNumber = invoices.reduce((max, invoice) => {
      return Math.max(max, parseInt(invoice.serial_number, 10));
    }, -Infinity);

    // Return the max serial number
    return res.status(200).json({ message: "success", data: maxSerialNumber });
  } catch (error) {
    console.error("Error fetching max serial number:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

controller.getInvoiceSeriesByUserId = async function (req, res) {
  try {
    // Find all unique invoice_series for the given userId
    const invoices = await model.invoice.findAll({
      attributes: [
        [
          sequelize.fn("DISTINCT", sequelize.col("invoice_serie")),
          "invoice_serie",
        ],
      ], // Use DISTINCT to get unique values
      where: {
        userId: req.params.id,
      },
    });

    return res.status(200).json({ message: "success", data: invoices });
  } catch (error) {
    console.error("Error fetching invoice_serie by userId: ", error);
    return res.status(500).send(error);
  }
};

controller.getPdfByInvoiceId = async function (req, res) {
  try {
    const pdf = await model.invoicePdf.findAll({
      where: { invoice_id: req.params.documentId },
    });
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.setHeader("Content-Type", "application/pdf");
    return res.status(200).send(pdf[0].dataValues.pdf_data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching pdf", error: error.message });
  }
};

controller.getAllMarksByUserId = async function (req, res) {
  try {
    const result = await model.myDataNewInvoice.findAll({
      where: { userId: req.params.id },
    });

    return res.status(200).json({ message: "success", data: result });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching marks", error: error.message });
  }
};

controller.getAfmByInvoiceMark = async function (req, res) {
  try {
    const result = await model.myDataNewInvoice.findOne({
      where: { invoice_mark: req.params.mark },
    });

    if (result && result.dataValues) {
      try {
        const invoice = await model.invoice.findOne({
          where: { id: result.dataValues.invoice_id },
        });

        if (invoice) {
          const customer = await model.customer.findOne({
            where: { afm: invoice.dataValues.afm },
          });
          return res.status(200).json({ message: "success", data: customer });
        }
      } catch (error) {
        return res.status.json({
          message: "Error fetching customer",
          error: error.message,
        });
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching afm", error: error.message });
  }
};

controller.getDailyTotalPrice = async function (req, res) {
  try {
    const userId = req.params.id;
    const dailyTotals = await model.invoice.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("published_date")), "date"],
        [sequelize.fn("SUM", sequelize.col("total_price")), "total_price"],
      ],
      where: { userId: userId },
      group: [sequelize.fn("DATE", sequelize.col("published_date"))],
      order: [sequelize.fn("DATE", sequelize.col("published_date"))],
    });

    return res.status(200).json(dailyTotals);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error fetching daily totals: " + error.message });
  }
};

module.exports = controller;

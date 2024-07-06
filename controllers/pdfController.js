const model = require("../models/index");
const { createInvoice } = require("../generic/pdf/generate");
const { where } = require("sequelize");

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
    if (!pdfTemplateData || !pdfTemplateData.logoImage) {
      next();
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
    };

    createInvoice(invoice, async (pdfData) => {
      if (!only_view) {
        try {
          const newInvoice = await model.invoice.create({
            cutsomer_name: customerData.name,
            published_date: customerData.date,
            afm: customerData.afm,
            invoice_type: informations.invoice_type,
            price: totalPrice,
            fpa: totalFpa,
            total_price: totalFinalPrice,
            my_data_code: informations.my_data,
            userId: userId,
          });

          await model.invoicePdf.create({
            invoice_id: newInvoice.id,
            pdf_data: pdfData,
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

controller.getAllInvoicesByUserId = async function (req, res) {
  try {
    const invoices = await model.invoice.findAll({
      where: { userId: req.params.id },
    });
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.status(200).json(invoices);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching invoices", error: error.message });
  }
};

controller.getPdfByInvoiceId = async function (req, res) {
  try {
    const pdf = await model.invoicePdf.findAll({
      where: { invoice_id: req.params.documentId },
    });
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.status(200).send(pdf[0].dataValues.pdf_data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching pdf", error: error.message });
  }
};

module.exports = controller;

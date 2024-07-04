// controller.js
const model = require("../models/index");
const { createInvoice } = require("../generic/pdf/generate");

const controller = {};

controller.insertPdfTemplateData = async function(req, res) {
    try {
        const logoImage = req.file ? req.file.buffer : null;
        const newPdfTemplateData = await model.pdfData.create({
            logoImage: logoImage,
            firstColor: req.body.firstColor,
            secondColor: req.body.secondColor,
            textSize: req.body.textSize,
            logoSize: req.body.logoSize,
            notes: req.body.notes[0],
            userId: req.params.id
        });
        return res.status(201).json({ message: "success", data: newPdfTemplateData });
    } catch (error) {
        return res.status(400).send({ error: 'Error creating data: ' + error.message });
    }
};

controller.updatePdfTemplateData = async function(req, res) {
    try {
        const existingData = await model.pdfData.findOne({
            where: { userId: req.params.id }
        });

        if (!existingData) {
            return res.status(404).json({ error: 'No data found for the user' });
        }
        console.log(req.body);
        const logoImage = req.file ? req.file.buffer : existingData.logoImage;
        const updatedPdfTemplateData = await model.pdfData.update({
            logoImage: logoImage,
            firstColor: req.body.firstColor,
            secondColor: req.body.secondColor,
            textSize: req.body.textSize,
            logoSize: req.body.logoSize,
            notes: req.body.notes
        }, {
            where: { userId: req.params.id }
        });

        return res.status(200).json({ message: "success", data: updatedPdfTemplateData });
    } catch (error) {
        return res.status(400).send({ error: 'Error updating data: ' + error.message });
    }
};

controller.getPdfTemplateDataByUserId = async function(req, res) {
    try {
        const pdfTemplateData = await model.pdfData.findOne({
            where: { userId: req.params.id }
        });
        if (!pdfTemplateData) {
            return res.status(404).json({ error: 'No data found' });
        }
        return res.status(200).json(pdfTemplateData);
    } catch (error) {
        return res.status(400).send({ error: 'Error fetching data: ' + error.message });
    }
};

controller.getImageByUserId = async function(req, res) {
    try {
        const pdfTemplateData = await model.pdfData.findOne({
            attributes: ['logoImage'],
            where: { userId: req.params.id }
        });
        if (!pdfTemplateData || !pdfTemplateData.logoImage) {
            return res.status(404).json({ error: 'No image found' });
        }

        res.set('Content-Type', 'image/png'); // Set appropriate content type
        return res.send(pdfTemplateData.logoImage);
    } catch (error) {
        return res.status(400).send({ error: 'Error fetching image: ' + error.message });
    }
};

controller.createInvoice = async function (req, res) {
    const userId = req.params.id;
    const customerData = req.body.formData.customerData;
    const products = req.body.formData.products;

    try {
        const userData = await model.userData.findAll({
            where: { userId: userId }
        });
        if (userData.length < 1) {
            return res.status(404).send({ error: 'User data not found' });
        }

        const pdfTemplateData = await model.pdfData.findOne({
            where: { userId: req.params.id }
        });
        if (!pdfTemplateData || !pdfTemplateData.logoImage) {
            next();
        }

        const invoice = {
            userData: userData[0].dataValues,
            pdfTemplateData: pdfTemplateData.dataValues,
            customerData: {
                ...customerData
            },
            products: {
                ...products
            },
            items: [
                {
                    item: 'TC 100',
                    description: 'Toner Cartridge',
                    quantity: 2,
                    amount: 6000,
                },
                {
                    item: 'USB_EXT',
                    description: 'USB Cable Extender',
                    quantity: 1,
                    amount: 2000,
                },
            ],
            subtotal: 8000,
            paid: 0,
            invoice_nr: 1234,
        };

        createInvoice(invoice, (pdfData) => {
            res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfData);
        });

    } catch (error) {
        res.status(500).json({ message: "Error creating invoice", error: error.message });
    }
};

module.exports = controller;

const model = require("../models/pdfTemplateModel");

const controller = {};

controller.insertPdfTemplateData = async function(req, res) {
    try {
        const logoImage = req.file ? req.file.buffer : null;
        const newPdfTemplateData = await model.create({
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
        const existingData = await model.findOne({
            where: { userId: req.params.id }
        });

        if (!existingData) {
            return res.status(404).json({ error: 'No data found for the user' });
        }

        const logoImage = req.file ? req.file.buffer : existingData.logoImage;
        const updatedPdfTemplateData = await model.update({
            logoImage: logoImage,
            firstColor: req.body.firstColor,
            secondColor: req.body.secondColor,
            textSize: req.body.textSize,
            logoSize: req.body.logoSize,
            notes: req.body.notes[0]
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
        const pdfTemplateData = await model.findOne({
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
        const pdfTemplateData = await model.findOne({
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

module.exports = controller;

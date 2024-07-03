const model = require("../models/pdfTemplateModel");
const getUserIdFromToken = require("../generic/getByToken");
const controller = {};



controller.insertPdfTemplateData = async function(req, res) {
    console.log(req.body);
    try {
        const newPdfTemplateData = await model.create({
            logoImage: req.body.logoImage,
            firstColor: req.body.firstColor,
            secondColor: req.body.secondColor,
            textSize: req.body.textSize,
            userId: req.params.id
        });
        return res.status(201).json({ message: "success", data: newPdfTemplateData });
    } catch (error) {
        return res.status(400).send({ error: 'Error creating product: ' + error.message });
    }
};


module.exports = controller;
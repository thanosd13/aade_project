const model = require("../models/customerModel");
const afmService = require("../services/afmService");
const controller = {};


controller.createCustomer = async function(req, res) {
    try {
        const newCustomer = await model.create({
            afm: req.body.formData.afm,
            name: req.body.formData.name,
            country: req.body.formData.country,
            city: req.body.formData.city,
            address: req.body.formData.address,
            street_number: req.body.formData.street_number,
            postal_code: req.body.formData.postal_code,
            doy: req.body.formData.doy,
            work: req.body.formData.work,
            email: req.body.formData.email,
            tel_number: req.body.formData.tel_number,
            userId: req.params.userId
        });
        res.status(201).json({message: "success", data: newCustomer});
    } catch (error) {
        res.status(400).send({ error: 'Error creating customer: ' + error.message });
    }
};

controller.getDataByAfm = async function(req, res) { 
    const afm = req.params.afm;  // Accessing afm from route parameters
    try {
      const response = await afmService.callSoap(afm, res); 
      return res.status(200).json(response);
    } catch (error) {
        res.status(404).send({ error: 'Error fetch data: ' + error.message });
    }
};
  

module.exports = controller;
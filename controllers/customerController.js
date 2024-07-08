const model = require("../models/customerModel");
const getUserIdFromToken = require("../generic/getByToken");
const afmService = require("../services/afmService");
const controller = {};

controller.createCustomer = async function (req, res) {
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
      userId: req.params.userId,
    });
    return res.status(201).json({ message: "success", data: newCustomer });
  } catch (error) {
    return res
      .status(400)
      .send({ error: "Error creating customer: " + error.message });
  }
};

controller.updateCustomer = async function (req, res) {
  const customerId = req.params.id;
  const formData = req.body.formData;
  const idFromToken = getUserIdFromToken(
    req.headers.authorization?.split(" ")[1]
  );
  const userId = req.body.formData.userId;

  if (userId != idFromToken) {
    return res.status(401).json({ message: "Unathorized user!" });
  }

  try {
    const [updatedRows] = await model.update(
      {
        afm: formData.afm,
        name: formData.name,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        street_number: formData.street_number,
        postal_code: formData.postal_code,
        doy: formData.doy,
        work: formData.work,
        email: formData.email,
        tel_number: formData.tel_number,
      },
      {
        where: { id: customerId },
      }
    );
    return res.status(200).json({ message: "Customer updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .send({ error: "Error updating customer: " + error.message });
  }
};

controller.deleteCustomer = async function (req, res) {
  const idFromToken = getUserIdFromToken(
    req.headers.authorization?.split(" ")[1]
  );
  const userId = req.params.userId;

  if (userId != idFromToken) {
    return res.status(401).json({ message: "Unathorized user!" });
  }

  try {
    const deletedUser = await model.destroy({
      where: { id: req.params.id },
    });
    return res.status(204).send();
  } catch (error) {
    return res
      .status(500)
      .send({ error: "Error delete customer: " + error.message });
  }
};

controller.getCustomersByUserId = async function (req, res) {
  const userId = req.params.userId; // Extract user ID from request parameters
  try {
    const customers = await model.findAll({
      where: { userId: userId }, // Query condition to find customers by user ID
    });
    return res.status(200).json(customers);
  } catch (error) {
    return res
      .status(500)
      .send({ error: "Error fetching customers: " + error.message });
  }
};

controller.getDataByAfm = async function (req, res) {
  const afm = req.params.afm; // Accessing afm from route parameters
  try {
    const response = await afmService.callSoap(afm, res);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(404)
      .send({ error: "Error fetch data: " + error.message });
  }
};

module.exports = controller;

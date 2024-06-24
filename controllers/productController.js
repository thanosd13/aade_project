const model = require("../models/productModel");
const getUserIdFromToken = require("../generic/getByToken");
const controller = {};



controller.createProduct = async function(req, res) {
    try {
        const newProduct = await model.create({
            name: req.body.formData.name,
            price: req.body.formData.price,
            type: req.body.formData.type,
            fpa: req.body.formData.fpa,
            final_price: req.body.formData.final_price,
            userId: req.params.userId
        });
        return res.status(201).json({ message: "success", data: newProduct });
    } catch (error) {
        return res.status(400).send({ error: 'Error creating product: ' + error.message });
    }
};

controller.updateProduct = async function(req, res) {
    const productId = req.params.id;  
    const idFromToken = getUserIdFromToken(req.headers.authorization?.split(" ")[1]);
    const userId = req.body.formData.userId;

    if(userId != idFromToken) {
        return res.status(401).json({message: "Unathorized user!"});
    }

    try {
        const [updatedRows] = await model.update({
            name: req.body.formData.name,
            price: req.body.formData.price,
            type: req.body.formData.type,
            fpa: req.body.formData.fpa,
            final_price: req.body.formData.final_price
        }, {
            where: { id: productId } 
        });
        return res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
        return res.status(500).send({ error: 'Error updating customer: ' + error.message });
    }
}

controller.deleteProduct = async function(req, res) {

    const idFromToken = getUserIdFromToken(req.headers.authorization?.split(" ")[1]);
    const userId = req.params.userId;

    if(userId != idFromToken) {
        return res.status(401).json({message: "Unathorized user!"});
    }

    try {
        const deleteProduct = await model.destroy ({
            where: { id: req.params.id }
        })
        return res.status(204).send();
    } catch (error) {
        return res.status(500).send({error: 'Error delete product: ' + error.message });
    }
}

controller.getProducts = async function(req, res) {
    const userId = req.params.userId;
    try {
        const products = await model.findAll({
            where: { userId: userId }
        })
        return res.status(200).json(products)
    } catch (error) {
        return res.status(400).send({ error: 'Error fetch products: ' + error.message });
    }
}


module.exports = controller;
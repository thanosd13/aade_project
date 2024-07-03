const model = require("../models/index");
const { Op, where } = require("sequelize");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require("../generic/emailFunc");
const { user } = require("./indexController");
const { createPdf } = require("../generic/pdf/generate");
const {createInvoice} = require("../generic/pdf/generate");
const controller = {};


// find all users
controller.getAll = async function (req, res) {
    try {
        const userData = await model.user.findAll();
        if (userData.length > 0) {
             res
                .status(200)
                .json({ message: "Connection successful", data: userData });
        } else {
            res.status(200).json({ message: "Connection failed", data: [] });
        }
    } catch (error) {
        res.status(404).json({ message: error });
    }
};



// find user by username
controller.getUsername = async function (req, res) {
    try {
        var userData = await model.user.findAll({
        where: { username: { [Op.like]: `%${req.params.username}%` } },
        });
        if (userData.length > 0) {
            res
            .status(200)
            .json({ message: "Connection successful", data: userData });
        } else {
        res.status(200).json({ message: "Connection failed", data: [] });
        }
    } catch (error) {
        res.status(404).json({ message: error });
    }
};


// create new user
controller.createNew = async function (req, res) {
    try {
        //   check data has already been created
        const checkData = await model.user.findAll({
        where: {
            [Op.or]: {
                username: req.body.username
                },
            },
        });
    if (checkData.length > 0) {
        res.status(409).json({ message: "username has already in use" });
    } else {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await model.user
            .create({
            username: req.body.username,
            password: hashedPassword,
            role: 1
        })
        await sendEmail();
        return res.status(201).json({user: req.body.username, role: 1});
    }
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

// login function
controller.login = async function (req, res) {
    try {
        console.log(req.body);
        // Use findOne to get a single user
        const user = await model.user.findOne({
            where: {
              username: req.body.formData.email
            }
        });

        if(!user) {
            return res.status(401).json({message: 'Authentication failed!'});
        }

        // Corrected bcrypt.compare to compare password from request and user's stored hashed password
        const passwordMatch = await bcrypt.compare(req.body.formData.password, user.password); // assuming the password field is named 'password'
        if(!passwordMatch) {
            return res.status(401).json({message: 'Authentication failed!'});
        }
        const token = jwt.sign({ id: user.id, username: user.username }, 'VbhxvsSEON', { expiresIn: '1000h' });
        return res.status(200).json({user: user, token: token});
        
    } catch(error) {
        res.status(404).json({message: error.message || "Error occurred"});
    }
}


//update user
controller.editAt = async function (req, res) {
    try {
        await model.user
            .findAll({ where: { id: req.body.id } })
            .then(async (result) => {
                if (result.length > 0) {
                    await model.user.update(
                       {
                           username: req.body.username,
                           password: req.body.password,
                           token: req.body.username + req.body.password,
                        },
                        { where: { id: req.body.id } }
                    );
                    res.status(200).json({
                        message: "update successful",
                        data: {
                        id: req.body.id,
                        username: req.body.username,
                        password: req.body.password,
                        token: req.body.username + req.body.password,
                        },
                    });
                } else {
                    res.status(500).json({ message: "update failed" });
                }
            });
    } catch (error) {
        res.status(404).json({ message: error });
    }
};


//delete user
controller.deleteUser = async function (req, res) {
    try {
        await model.user
            .findAll({ where: { id: req.body.id } })
            .then(async (result) => {
        if (result.length > 0) {
            await model.user.destroy({ where: { id: req.body.id } });
            res.status(200).json({ message: "delete user successfully" });
        } else {
            res.status(404).json({ message: "id user not found" });
            }
        });
    } catch (error) {
        res.status(404).json({ message: error });
    }
};


//insert user data
controller.insertUserData = async function (req, res) {
    
    try {
        await model.userData.create({
            afm: req.body.afm,
            name: req.body.name,
            country: req.body.country,
            city: req.body.city,
            address: req.body.address,
            street_number: req.body.street_number,
            postal_code: req.body.postal_code,
            doy: req.body.doy,
            work: req.body.work,
            email: req.body.email,
            tel_number: req.body.tel_number,
            userId: req.params.id
        })
        return res.status(201).send();
    } catch (error) {
        res.status(500).json({ message: error });
    }
}

//find user data
controller.findUserData = async function (req, res) {
    const userId = req.params.id;
    try {
        const userData = await model.userData.findAll({
            where: { userId: userId }
        });
        if(userData.length < 1) {
            return res.status(404).send();
        }
        return res.status(200).json(userData);
    } catch (error) {
        return res.status(500).json({message:error});
    }
}

//update user data
controller.updateUserData = async function (req, res) {

    const userDataId = req.params.id;
    const formData = req.body;

    try {
        await model.userData.update({
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
            tel_number: formData.tel_number
        },{
            where: { id: userDataId }
        })
        return res.status(200).send();
    } catch (error) {
        return res.status(500).send({ error: 'Error updating user data: ' + error.message });
    }
}

controller.createInvoice = function (req, res) {
    const invoice = {
        shipping: {
            name: 'John Doe',
            address: '1234 Main Street',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
            postal_code: 94111,
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

    try {
        createInvoice(invoice, 'invoice.pdf');
        res.status(200).json({ message: "Invoice created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error creating invoice", error: error.message });
    }
};


module.exports = controller;

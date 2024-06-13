const model = require("../models/index");
const { Op } = require("sequelize");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require("../generic/emailFunc");
const { user } = require("./indexController");
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
        res.status(500).json({ message: "username has already in use" });
    } else {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await model.user
            .create({
            username: req.body.username,
            password: hashedPassword,
            role: 1
        })
        const sendMail = await sendEmail();
        return res.status(201).json({user: req.body.username, role: 1});
    }
    } catch (error) {
        res.status(404).json({ message: error });
    }
};

// login function
controller.login = async function (req, res) {
    try {
        // Use findOne to get a single user
        const user = await model.user.findOne({
            where: {
              username: req.body.username
            }
        });

        if(!user) {
            return res.status(401).json({message: 'Authentication failed!'});
        }

        // Corrected bcrypt.compare to compare password from request and user's stored hashed password
        const passwordMatch = await bcrypt.compare(req.body.password, user.password); // assuming the password field is named 'password'
        if(!passwordMatch) {
            return res.status(401).json({message: 'Authentication failed!'});
        }
        const token = jwt.sign({ id: user.id, username: user.username }, 'VbhxvsSEON', { expiresIn: '1000h' });
        return res.status(200).json({message: 'success!', token: token});
        
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

module.exports = controller;

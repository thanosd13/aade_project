// import module/package
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();
const userRoute = require("./routes/userRoutes");
const customerRoute = require("./routes/customerRoutes");
const productRoute = require("./routes/productRoutes");
const pdfRoute = require("./routes/pdfRoutes");
const authToken = require("./middleware/auth");
require('dotenv').config();


// setting middleware
app.use(morgan("dev"));
app.use(cors());
app.use(authToken);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/user", userRoute);
app.use("/customer", customerRoute);
app.use("/product", productRoute);
app.use("/pdf", pdfRoute);
// setting error path
app.use((req, res, next) => {
    const err = new Error(`${req.url} not found in this server`);
    err.status = 404;
    next(err);
});
// setting another error program
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
});
// export app
module.exports = app;
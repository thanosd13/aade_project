const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
const app = express();
const userRoute = require("./routes/userRoutes");
const customerRoute = require("./routes/customerRoutes");
const productRoute = require("./routes/productRoutes");
const pdfRoute = require("./routes/pdfRoutes");
const authToken = require("./middleware/auth");
require('dotenv').config();

// Using Morgan for logging
app.use(morgan("dev"));
app.use(cors());
app.use(authToken);

// Increase the payload limit for JSON and URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// Define routes
app.use("/user", userRoute);
app.use("/customer", customerRoute);
app.use("/product", productRoute);
app.use("/pdf", pdfRoute);

// Error handling for non-existent routes
app.use((req, res, next) => {
    const err = new Error(`${req.url} not found in this server`);
    err.status = 404;
    next(err);
});

// Generic error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
});

// Export app for use in other files or testing
module.exports = app;

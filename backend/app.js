const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const bodyParser = require("body-parser");
const fileupload = require("express-fileupload");

app.use(express.json({ limit: "50mb" }));
app.use(cors({ origin: process.env.FRONTEND_URI, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileupload());

// Rourte Imports
const productRoute = require("./routes/product-route");
const userRoute = require("./routes/user-route");
const orderRoute = require("./routes/order-route");

// Middleware for errors
const errorMiddleware = require("./middleware/error");
const fileUpload = require("express-fileupload");

app.use("/api/v1", productRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", orderRoute);

// Middleware for users
app.use(errorMiddleware);

module.exports = app;

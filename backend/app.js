const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());

// Rourte Imports
const productRoute = require("./routes/product-route");
const userRoute = require("./routes/user-route");
const orderRoute = require("./routes/order-route");

// Middleware for errors
const errorMiddleware = require("./middleware/error");

app.use("/api/v1", productRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", orderRoute);

// Middleware for users
app.use(errorMiddleware);

module.exports = app;

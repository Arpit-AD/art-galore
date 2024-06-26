const app = require("./app");

const dotenv = require("dotenv");
const cloudinary = require("cloudinary");
const connectDatabase = require("./config/database");

// Handling uncaught exceptions
process.on("uncaughtException", (err) => {
	console.log(`ERROR: ${err}`);
	console.log(`Shutting down the server due to uncaught exception`);
	process.exit(1);
});

// Config
dotenv.config({ path: "backend/config/config.env" });

// Connection to database
connectDatabase();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const server = app.listen(process.env.PORT, () => {
	console.log(`Server running on http://localhost:${process.env.PORT}`);
});

// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
	console.log(`ERROR: ${err}`);
	console.log(`Shutting down the server due to unhandled promise rejection`);
	server.close(() => {
		process.exit(1);
	});
});

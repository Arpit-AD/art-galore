const app = require("./app");

const dotenv = require("dotenv");

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

const mongoose = require("mongoose");

const connectDatabase = async () => {
	await mongoose.connect(process.env.DB_URI).then((data) => {
		console.log(`MongoDb connected with server: ${data.connection.host}`);
	});
};

module.exports = connectDatabase;

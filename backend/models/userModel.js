const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Roles = require("../utils/enums/roles");

//// adforarpit76@gmail.com  arpit@72
//// ekjotkaurk13@gmail.com  ekjot@72

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please Enter your Name"],
		maxLength: [50, "Name cannot exceed 30 characters"],
		minLength: [4, "Name should have more than 4 characters"],
	},
	email: {
		type: String,
		required: [true, "Please Enter your Email"],
		unique: true,
		validate: [validator.isEmail, "Please enter a valid Email"],
	},
	password: {
		type: String,
		required: [true, "Please Enter the password"],
		minLength: [8, "Passowrd should be greater than 8 characters"],
		select: false,
	},
	avatar: {
		public_id: {
			type: String,
			required: true,
		},
		url: {
			type: String,
			required: true,
		},
	},
	role: {
		type: String,
		required: true,
		enum: Roles,
		default: Roles.SPECTATOR,
	},
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	followers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	following: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
});

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}
	this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN to get web token to access routes as per role.

userSchema.methods.getJWTToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

// To compare password

userSchema.methods.comparePassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

// To reset the password

userSchema.methods.getResetPasswordToken = function () {
	// random token generation
	const resetToken = crypto.randomBytes(20).toString("hex");

	// hashing and adding to userSchema
	const tokenCrypto = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	this.resetPasswordToken = tokenCrypto;

	this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

	return resetToken;
};

module.exports = mongoose.model("User", userSchema);

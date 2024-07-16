const ErrorHandler = require("../utils/error-handler");
const catchAsyncError = require("./catch-async-error");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return next(new ErrorHandler("Please login to access this resource", 401));
	}

	const token = authHeader.split(" ")[1];

	try {
		const decodedData = jwt.verify(token, process.env.JWT_SECRET);
		req.user = await User.findById(decodedData.id);

		if (!req.user) {
			return next(new ErrorHandler("User not found with this token", 404));
		}

		next();
	} catch (error) {
		return next(new ErrorHandler("Invalid or expired token", 401));
	}
});

exports.authorizeRole = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new ErrorHandler(
					`Role: ${req.user.role} is not allowed to access this resource`,
					403,
				),
			);
		}
		next();
	};
};

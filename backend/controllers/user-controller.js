const ErrorHandler = require("../utils/error-handler.js");
const ApiFeatures = require("../utils/api-features.js");
const User = require("../models/userModel.js");
const Product = require("../models/productModel.js");
const catchAsyncError = require("../middleware/catch-async-error.js");
const sendToken = require("../utils/jwt-token.js");
const sendEmail = require("../utils/send-email.js");
const crypto = require("crypto");
const Roles = require("../utils/enums/roles.js");
const cloudinary = require("cloudinary");

// Register the user

const validateImage = (image) => {
	const allowedMimeTypes = [
		"image/jpeg",
		"image/png",
		"image/gif",
		"image/webp",
	];
	const imageType = image.split(";")[0].split(":")[1];
	return allowedMimeTypes.includes(imageType);
};

exports.registerUser = catchAsyncError(async (req, res, next) => {
	let profile_url =
		"https://res.cloudinary.com/dkb4cxn9b/image/upload/v1721113851/artGaloreAvatars/no_profile.png";
	if (req.body.avatar) {
		if (validateImage(req.body.avatar)) {
			const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
				folder: "artGaloreAvatars",
				width: 150,
				crop: "scale",
			});
			profile_url = myCloud.secure_url;
		}
	}
	const { name, email, password, reEnteredPassword, role } = req.body;

	if (password != reEnteredPassword) {
		return next(new ErrorHandler("Passwords did not matched", 400));
	}
	const user = await User.create({
		name,
		email,
		password,
		role,
		avatar: {
			public_id: "this is sample Id",
			url: profile_url,
		},
	});

	sendToken(user, 201, res);
});

// Login user

exports.loginUser = catchAsyncError(async (req, res, next) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return next(new ErrorHandler("Please Enter Email and Password", 400));
	}

	const user = await User.findOne({ email }).select("+password");

	if (!user) {
		return next(new ErrorHandler("Invalid email or password", 401));
	}

	const isPasswordMatched = await user.comparePassword(password);

	if (!isPasswordMatched) {
		return next(new ErrorHandler("Invalid email or password", 401));
	}

	sendToken(user, 200, res);
});

// Logout User

exports.logout = catchAsyncError(async (req, res, next) => {
	res.status(200).json({
		success: true,
		message: "Logged Out",
	});
});

// Forgot Password

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new ErrorHandler("User not found", 404));
	}

	// get reset password token
	const resetToken = user.getResetPasswordToken();
	await user.save({ validateBeforeSave: false });

	const resetPasswordUrl = `${req.protocol}://${req.get(
		"host",
	)}/api/v1/password/${resetToken}`;

	const message = `Your password reset token is :- \n \n ${resetPasswordUrl} \n \n If you have not requested this email then, please ignore it.`;

	try {
		await sendEmail({
			email: user.email,
			subject: `Art Gallery Password Recovery`,
			message,
		});

		res.status(200).json({
			success: true,
			message: `Email sent to ${user.email} successfully`,
		});
	} catch (err) {
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;
		await user.save({ validateBeforeSave: false });
		return next(new ErrorHandler(err.response, 500));
	}
});

// to handle new password - resetPassword

exports.resetPassword = catchAsyncError(async (req, res, next) => {
	// creating token hash
	const tokenCrypto = crypto
		.createHash("sha256")
		.update(req.params.token)
		.digest("hex");

	const user = await User.findOne({
		resetPasswordToken: tokenCrypto,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user)
		return next(
			new ErrorHandler(
				"Reset password token is invalid or has been expired",
				400,
			),
		);

	if (req.body.password !== req.body.confirmPassword) {
		return next(
			new ErrorHandler("Password do not match with each other.", 400),
		);
	}

	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;

	await user.save();
	sendToken(user, 200, res);
});

exports.getUserDetails = catchAsyncError(async (req, res, next) => {
	const user = await User.findById(req.user.id);

	res.status(200).json({
		success: true,
		user,
	});
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
	const user = await User.findById(req.user.id).select("+password");
	const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
	if (!isPasswordMatched) {
		return next(new ErrorHandler("Password is incorrect", 401));
	}

	if (req.body.newPassword !== req.body.confirmPassword) {
		return next(new ErrorHandler("Password does not match", 400));
	}
	user.password = req.body.newPassword;
	await user.save();
	sendToken(user, 200, res);
});

exports.updateUserProfile = catchAsyncError(async (req, res, next) => {
	const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
		folder: "artGaloreAvatars",
		width: 150,
		crop: "scale",
	});
	const newUserData = {
		name: req.body.name,
		email: req.body.email,
		role: req.body.role,
		description: req.body.description,
		avatar: {
			public_id: "this is sample Id",
			url: myCloud.secure_url,
		},
	};
	// we will add cloudinary later to update the avatar
	const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
		new: true,
		runValidators: true,
		useFindAndModify: false,
	});

	res.status(200).json({
		success: true,
		user,
	});
});

//get artists

exports.getArtists = catchAsyncError(async (req, res, next) => {
	const users = await User.find({ role: Roles.ARTIST });
	const usersCount = users.length;
	res.status(200).json({
		success: true,
		_users: users,
		_userCount: usersCount,
	});
});

exports.getSpectators = catchAsyncError(async (req, res, next) => {
	const users = await User.find({ role: Roles.SPECTATOR });
	const usersCount = users.length;
	res.status(200).json({
		success: true,
		_users: users,
		_userCount: usersCount,
	});
});
//get single user
exports.getUser = catchAsyncError(async (req, res, next) => {
	const user = await User.findById(req.params.id);
	if (!user) {
		return next(
			new ErrorHandler(`User does not exists with id: ${req.params.id}`),
		);
	}

	res.status(200).json({
		success: true,
		user,
	});
});

// delete user
exports.deleteUser = catchAsyncError(async (req, res, next) => {
	const user = await User.findById(req.params.id);
	if (!user) {
		return next(
			new ErrorHandler(`User not found with this id: ${req.params.id}`, 404),
		);
	}
	_user = await User.findByIdAndDelete(req.params.id);

	res.status(200).json({
		success: true,
		message: "User deleted successfully",
	});
});

// follow user
exports.followUser = catchAsyncError(async (req, res, next) => {
	const { followUserId } = req.body;
	const userId = req.user.id;

	const followUser = await User.findById(followUserId);
	if (!followUser) {
		return next(new ErrorHandler("User not found to follow", 404));
	}
	const user = await User.findByIdAndUpdate(
		userId,
		{
			$addToSet: { following: followUserId },
		},
		{ new: true },
	);
	await User.findByIdAndUpdate(followUserId, {
		$addToSet: { followers: userId },
	});

	res
		.status(200)
		.json({ success: true, message: "User followed successfully", user });
});

//unfollow user

exports.unfollowUser = catchAsyncError(async (req, res, next) => {
	try {
		const { unfollowUserId } = req.body;
		const userId = req.user.id;

		const user = await User.findByIdAndUpdate(
			userId,
			{
				$pull: { following: unfollowUserId },
			},
			{ new: true },
		);
		await User.findByIdAndUpdate(unfollowUserId, {
			$pull: { followers: userId },
		});

		res.status(200).json({ message: "User unfollowed successfully", user });
	} catch (error) {
		return next(new ErrorHandler("Error unfollowing user", 500));
	}
});

// get followers of a user

exports.getUserFollowers = async (req, res, next) => {
	try {
		const userId = req.params.id;
		const user = await User.findById(userId).populate("followers", "username");

		res.status(200).json({ followers: user.followers });
	} catch (error) {
		return next(new ErrorHandler("Error fetching user followers", 500));
	}
};

// Get user's following list
exports.getUserFollowing = async (req, res, next) => {
	try {
		const userId = req.params.id;
		const user = await User.findById(userId).populate("following", "username");

		res.status(200).json({ following: user.following });
	} catch (error) {
		return next(new ErrorHandler("Error fetching user following list", 500));
	}
};

// add to wishlist
exports.addToWishlist = catchAsyncError(async (req, res, next) => {
	const { productId } = req.body;
	const userId = req.user.id;
	const product = await Product.findById(productId);
	if (!product) {
		return next(new ErrorHandler("Product not found", 404));
	}
	const user = await User.findByIdAndUpdate(
		userId,
		{
			$addToSet: { wishlist: productId },
		},
		{ new: true },
	);

	res.status(200).json({
		success: true,
		message: "Product added to wishlist successfully",
		user: user,
	});
});

// remove from wishlist
exports.removeFromWishlist = catchAsyncError(async (req, res, next) => {
	const { productId } = req.body;
	const userId = req.user.id;
	const product = await Product.findById(productId);
	if (!product) {
		return next(new ErrorHandler("Product not found", 404));
	}
	const user = await User.findByIdAndUpdate(
		userId,
		{
			$pull: { wishlist: productId },
		},
		{ new: true },
	);

	res.status(200).json({
		success: true,
		message: "Product removed from wishlist successfully",
		user,
	});
});

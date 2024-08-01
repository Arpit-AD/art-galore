const Product = require("../models/productModel");
const ErrorHandler = require("../utils/error-handler");
const ApiFeatures = require("../utils/api-features");
const AsyncErrors = require("../middleware/catch-async-error");
const PostStatus = require("../utils/enums/postStatus");
const catchAsyncError = require("../middleware/catch-async-error");

// Create new Product -- Admin Route
exports.createProduct = AsyncErrors(async (req, res, next) => {
	req.body.user = req.user.id;
	req.body.artist = req.user.name;
	let _product = await Product.create(req.body);

	res.status(200).json({
		success: true,
		message: "Product Successfully Created",
		_product,
	});
});

// Get all products
exports.getProducts = AsyncErrors(async (req, res) => {
	const resultPerPage = 10;
	req.query.postStatus = PostStatus.APPROVED;
	const _apiFeature = new ApiFeatures(Product.find(), req.query)
		.search()
		.filter()
		.pagination(resultPerPage);

	const _products = await _apiFeature.query;
	const _productCount = _products.length;
	res
		.status(200)
		.json({ success: true, _products, _productCount: _productCount });
});

// Get products by Status

exports.getProductsByStatus = AsyncErrors(async (req, res) => {
	const resultPerPage = 10;
	const _apiFeature = new ApiFeatures(Product.find(), req.query)
		.search()
		.filter()
		.pagination(resultPerPage);

	const _products = await _apiFeature.query;
	const _productCount = _products.length;
	res.status(200).json({
		success: true,
		_products: _products,
		_productCount: _productCount,
	});
});

// Get Product Details
exports.getProductDetails = AsyncErrors(async (req, res, next) => {
	const _product = await Product.findById(req.params.id);
	if (!_product) {
		return next(new ErrorHandler("Product Not Found", 404));
	}
	return res.status(200).json({
		success: true,
		_product,
	});
});

// Update any _product -- Admin Route
exports.updateProduct = AsyncErrors(async (req, res) => {
	let _product = await Product.findById(req.params.id);
	if (!_product) {
		return next(new ErrorHandler("Product Not Found", 404));
	}

	_product = await Product.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
		useFindAndModify: false,
	});

	res.status(200).json({
		success: true,
		message: "Product was updated Successfully",
		_product,
	});
});

// Delete a _product -- Admin Route
exports.deleteProduct = AsyncErrors(async (req, res, next) => {
	let _product = await Product.findById(req.params.id);
	if (!_product) {
		return next(new ErrorHandler("Product Not Found", 404));
	}
	_product = await Product.findByIdAndDelete(req.params.id);

	res.status(200).json({
		success: true,
		message: "Product deleted Successfully",
	});
});

// Create New Review or update review

exports.createProductReview = catchAsyncError(async (req, res, next) => {
	const { rating, comment, productId } = req.body;
	const _review = {
		user: req.user._id,
		name: req.user.name,
		avatar: req.user.avatar,
		rating: Number(rating),
		comment,
	};
	const product = await Product.findById(productId);
	const isReviewed = product.reviews.find((review) => {
		return review.user?.toString() === req.user._id?.toString();
	});
	if (isReviewed) {
		product.reviews.forEach((review) => {
			if (
				review.user?.toString() === req.user._id?.toString() &&
				(review.rating != Number(rating) || review.comment != comment)
			) {
				review.rating = Number(rating);
				review.comment = comment;
			}
		});
	} else {
		product.reviews.push(_review);
	}
	product.numberOfReviews = product.reviews.length;
	let total = 0;
	product.reviews.forEach((review) => {
		total += review.rating;
	});
	product.ratings = total / product.reviews.length;

	await product.save({ validateBeforeSave: false });

	res.status(200).json({
		success: true,
		product,
	});
});

// Get all reviews of a product

exports.getProductReviews = catchAsyncError(async (req, res, next) => {
	const product = await Product.findById(req.query.id);

	if (!product) {
		return next(new ErrorHandler("Product Not Found", 404));
	}

	res.status(200).json({
		success: true,
		reviews: product.reviews,
	});
});

// delete review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
	const product = await Product.findById(req.query.productId);

	if (!product) {
		return next(new ErrorHandler("Product Not Found", 404));
	}
	const reviews = product.reviews.filter(
		(review) => review._id.toString() != req.query.id.toString(),
	);

	let total = 0;
	product.reviews.forEach((review) => {
		total += review.rating;
	});
	const ratings = total / reviews.length;
	const numberOfReviews = reviews.length;

	await Product.findByIdAndUpdate(
		req.query.productId,
		{ reviews, ratings, numberOfReviews },
		{ new: true, runValidators: true, useFindAndModify: false },
	);
	res.status(200).json({
		success: true,
	});
});

const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/error-handler");
const ApiFeatures = require("../utils/api-features");
const AsyncErrors = require("../middleware/catch-async-error");
const PostStatus = require("../utils/enums/postStatus");
const catchAsyncError = require("../middleware/catch-async-error");

//create new order
exports.newOrder = catchAsyncError(async (req, res, next) => {
	const {
		shippingInformation,
		orderItems,
		paymentInformation,
		itemsPrice,
		taxPrice,
		shippingPrice,
		totalPrice,
	} = req.body;

	const order = await Order.create({
		shippingInformation,
		orderItems,
		paymentInformation,
		itemsPrice,
		taxPrice,
		shippingPrice,
		totalPrice,
		paidAt: Date.now,
		user: req.user._id,
	});

	res.status(200).json({
		success: true,
		order,
	});
});

// get single order  4hr20min20sec

exports.getOrderById = catchAsyncError(async (req, res, next) => {
	const order = await Order.findById(req.params.id).populate(
		"user",
		"name email",
	);

	if (!order) {
		return next(new ErrorHandler("Order not found with this id", 404));
	}

	res.status(200).json({
		success: true.valueOf,
		order,
	});
});

// get all orders

exports.getOrdersByUser = catchAsyncError(async (req, res, next) => {
	const orders = await Order.find({ user: req.user._id.toString() });

	res.status(200).json({
		success: true.valueOf,
		orders,
	});
});

// get all orders
exports.getOrders = catchAsyncError(async (req, res, next) => {
	const orders = await Order.find();

	let totalAmount = 0;
	orders.forEach((order) => {
		totalAmount += order.totalPrice;
	});

	res.status(200).json({
		success: true,
		orders,
		totalAmount,
	});
});

// update order status
exports.updateOrderStatus = catchAsyncError(async (req, res, next) => {
	const order = await Order.findById(req.params.id);

	if (!order) {
		return next(new ErrorHandler("Order not found with this id", 404));
	}

	if (order.orderStatus === "delivered") {
		return next(new ErrorHandler("You have delivered this product", 404));
	}

	order.orderItems.forEach(async (item) => {
		await updateStock(item.product, item.quantity);
	});

	order.orderStatus = req.body.status;
	if (req.body.status === "delivered") order.deliveredAt = Date.now();

	await order.save({ validateBeforeSave: false });
	res.status(200).json({
		success: true,
	});
});

const updateStock = async (id, quantity) => {
	const product = await Product.findById(id);
	product.stock -= quantity;
	await product.save({ validateBeforeSave: false });
};

// delete order

exports.deleteOrder = catchAsyncError(async (req, res, next) => {
	const order = await Order.findById(req.params.id);
	if (!order) {
		return next(new ErrorHandler("Order not found with this id", 404));
	}

	await Order.findOneAndDelete(req.paramms.id);
	res.status(200).json({
		success: true,
	});
});

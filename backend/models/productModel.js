const mongoose = require("mongoose");
const PostStatus = require("../utils/enums/postStatus");

const productSchema = mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please enter the product name"],
	},
	majorColor: {
		type: String,
		required: [true, "Please provide a major color present in your art."],
	},
	description: {
		type: String,
		required: [true, "Please enter the product description"],
	},
	price: {
		type: Number,
		required: [true, "Please enter the product Price"],
		maxLength: [8, "Price cannot exceed 8 figures"],
	},
	ratings: {
		type: Number,
		default: 0,
	},
	images: [
		{
			public_id: {
				type: String,
				required: true,
			},
			url: {
				type: String,
				required: true,
			},
		},
	],
	category: {
		type: String,
		required: [true, "Please enter product category"],
	},
	stock: {
		type: Number,
		required: [true, "Please enter stock of the product"],
		maxLength: [4, "Stock cannot exceed 4 figures"],
		default: 1,
	},
	numberOfReviews: {
		type: Number,
		default: 0,
	},
	reviews: [
		{
			user: {
				type: mongoose.Schema.ObjectId,
				ref: "User",
				required: true,
			},
			name: {
				type: String,
				required: true,
			},
			rating: {
				type: Number,
				required: true,
			},
			comment: {
				type: String,
				required: true,
			},
		},
	],
	artist: {
		type: String,
		required: true,
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: "User",
		required: true,
	},
	createdDate: {
		type: Date,
		default: Date.now,
	},
	postStatus: {
		type: String,
		required: true,
		enum: PostStatus,
		default: PostStatus.PENDING,
	},
});

module.exports = mongoose.model("Product", productSchema);

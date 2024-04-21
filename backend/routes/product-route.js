const express = require("express");
const {
	getProducts,
	createProduct,
	updateProduct,
	deleteProduct,
	getProductDetails,
	getProductsByStatus,
	createProductReview,
	getProductReviews,
	deleteReview,
} = require("../controllers/product-controller");
const {
	isAuthenticatedUser,
	authorizeRole,
} = require("../middleware/authentication");
const Roles = require("../utils/enums/roles");

const router = express.Router();

router.route("/products").get(getProducts);
router
	.route("/products/status")
	.get(
		isAuthenticatedUser,
		authorizeRole(Roles.ARTIST, Roles.ADMIN),
		getProductsByStatus,
	);
router
	.route("/products/new")
	.post(isAuthenticatedUser, authorizeRole(Roles.ARTIST), createProduct);
router
	.route("/product/:id")
	.put(
		isAuthenticatedUser,
		authorizeRole(Roles.ARTIST, Roles.ADMIN),
		updateProduct,
	)
	.delete(
		isAuthenticatedUser,
		authorizeRole(Roles.ARTIST, Roles.ADMIN),
		deleteProduct,
	)
	.get(getProductDetails);

router.route("/review").put(isAuthenticatedUser, createProductReview);
router
	.route("/reviews")
	.get(getProductReviews)
	.delete(isAuthenticatedUser, deleteReview);

module.exports = router;

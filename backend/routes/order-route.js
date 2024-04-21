const express = require("express");
const {
	isAuthenticatedUser,
	authorizeRole,
} = require("../middleware/authentication");
const Roles = require("../utils/enums/roles");
const {
	newOrder,
	getOrderById,
	getOrders,
	getOrdersByUser,
	updateOrderStatus,
	deleteOrder,
} = require("../controllers/order-controller");
const {
	getUserFollowing,
	getUserFollowers,
	unfollowUser,
	followUser,
} = require("../controllers/user-controller");

const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, newOrder);
router
	.route("/order/:id")
	.get(isAuthenticatedUser, getOrderById)
	.put(isAuthenticatedUser, authorizeRole(Roles.ADMIN), updateOrderStatus)
	.delete(isAuthenticatedUser, authorizeRole(Roles.ADMIN), deleteOrder);
router.route("/orders").get(isAuthenticatedUser, getOrdersByUser);
router
	.route("/orders/admin")
	.get(isAuthenticatedUser, authorizeRole(Roles.ADMIN), getOrders);
module.exports = router;

const express = require("express");
const {
	registerUser,
	loginUser,
	logout,
	forgotPassword,
	resetPassword,
	getUserDetails,
	updatePassword,
	updateUserProfile,
	getArtists,
	getSpectators,
	getUser,
	deleteUser,
	followUser,
	unfollowUser,
	getUserFollowers,
	getUserFollowing,
} = require("../controllers/user-controller");
const router = express.Router();
const {
	isAuthenticatedUser,
	authorizeRole,
} = require("../middleware/authentication");
const Roles = require("../utils/enums/roles");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/profile").get(isAuthenticatedUser, getUserDetails);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/profile/:id").put(isAuthenticatedUser, updateUserProfile);
router.route("/artists").get(getArtists);
router
	.route("/spectators")
	.get(isAuthenticatedUser, authorizeRole(Roles.ADMIN), getSpectators);
router
	.route("/user/:id")
	.get(getUser)
	.delete(isAuthenticatedUser, authorizeRole(Roles.ADMIN), deleteUser);
router.route("/user/follow").put(isAuthenticatedUser, followUser);
router.route("/user/unfollow").put(isAuthenticatedUser, unfollowUser);
router.route("/user/followers/:id").get(isAuthenticatedUser, getUserFollowers);
router.route("/user/following/:id").get(isAuthenticatedUser, getUserFollowing);

module.exports = router;

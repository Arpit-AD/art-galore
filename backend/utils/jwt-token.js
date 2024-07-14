// Creating token and saving in cookie
const sendToken = (user, statusCode, res) => {
	const token = user.getJWTToken();

	const cookieExpireTime = process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000;

	res
		.status(statusCode)
		.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "None",
			expires: new Date(Date.now() + cookieExpireTime),
		})
		.json({
			success: true,
			user,
			token,
		});
};

module.exports = sendToken;

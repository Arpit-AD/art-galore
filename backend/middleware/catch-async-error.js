module.exports = (AsyncErrors) => (req, res, next) => {
	Promise.resolve(AsyncErrors(req, res, next)).catch(next);
};

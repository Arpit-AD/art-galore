class ApiFeatures {
	constructor(query, queryStr) {
		(this.query = query), (this.queryStr = queryStr);
	}

	search() {
		const keyword = this.queryStr.keyword
			? {
					name: {
						$regex: this.queryStr.keyword,
						$options: "i", // compared case insensitive - present in mongoDB website
					},
			  }
			: {};

		this.query = this.query.find({ ...keyword });
		return this;
	}

	filter() {
		const queryCopy = { ...this.queryStr };

		// Removing some fields for category;
		const removeKeys = ["keyword", "page", "limit"];
		removeKeys.forEach((key) => delete queryCopy[key]);
		// normal filter cannot be used to filter product according to price because this gives us the exact value of the key
		let queryStr = JSON.stringify(queryCopy);
		queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
		this.query = this.query.find(JSON.parse(queryStr));
		return this;
	}

	pagination(resultPerPage) {
		const currentPage = this.queryStr.page || 1;
		const skipPages = resultPerPage * (currentPage - 1);

		this.query = this.query.limit(resultPerPage).skip(skipPages);

		return this;
	}
}

module.exports = ApiFeatures;

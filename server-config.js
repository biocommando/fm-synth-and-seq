const config = {
	port: process.env.PORT ? process.env.PORT : 8080,
	pathToStaticFiles: '/ui-js/dist',
	limits: {
		users: 100,
		files: 10,
		dataSize: 1e6
	}
};

module.exports = {
	config
}
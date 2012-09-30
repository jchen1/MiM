function start(response) {
	console.log("start() called");
	response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello there. You're not in the right place.");
    response.end();
}

exports.start = start;
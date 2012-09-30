function start(response) {
	console.log("start() called");
	response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello there. Try /pull");
    response.end();
}

exports.start = start;
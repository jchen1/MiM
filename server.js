var http = require("http");
var url = require("url");
var querystring = require("querystring");

function start(route, handle) {
	function onRequest(request, response) {
		var pathName = url.parse(request.url).pathname;
		var tag = querystring.parse(url.parse(request.url).query)['tag'];
		console.log("Request for " + pathName + " received.");

		route(handle, pathName, tag, response);
	}

	http.createServer(onRequest).listen(8888);
	console.log("Started server.");
}

exports.start = start;
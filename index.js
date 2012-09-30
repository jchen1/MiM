var static = require('node-static');
var file = new(static.Server);

require('http').createServer(function(request, response) {
    request.addListener('end', function() {
	fileName = '.' + request.url;
	if (fileName == './')
	    file.serveFile('./templates/main.html', 200, {}, request, response);
	else if (fileName.substr(0, 8) == './assets')
	    file.serve(request, response);
    });
}).listen(8080);

var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var tumblr = require("./tumblr");

var handle = {}
//handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/pull"] = tumblr.pull;

server.start(router.route, handle);
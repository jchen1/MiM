var static = require('node-static');
var file = new(static.Server);
var express = require('express');
var app = express();
app.use(express.bodyParser());
app.get(/^\/.*$/, function(request, response) {
    request.addListener('end', function() {
	fileName = '.' + request.url;
	if (fileName == './')
	    file.serveFile('./templates/main.html', 200, {}, request, response);
	else if (fileName.substr(0, 8) == './assets')
	    file.serve(request, response);
    });
});
app.post('/', function (request, response) {
    tumblr.tagged(response, request.param("tag", null));
});
app.listen(8080);

var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var tumblr = require("./tumblr");

var handle = {}
//handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/tagged"] = tumblr.tagged;

server.start(router.route, handle);
var static = require('node-static');
var file = new(static.Server);
var express = require('express');
var app = express();
app.use(express.bodyParser());
app.use(express.favicon("./favicon.ico"));
app.get(/^\/.*$/, function(request, response) {
    request.addListener('end', function() {
	fileName = '.' + request.url;
	if (fileName == './')
	    file.serveFile('./templates/main.html', 200, {}, request, response);
	else if (fileName.substr(0, 8) == './assets')
	    file.serve(request, response);
    });
});

var tumblr = require("./tumblr");

app.post('/submit', function (request, response) {
    var q = request.param("q", null);
    if (q.charAt(0) == '#')
	tumblr.tagged(response, q);
    else
	tumblr.urlpost(response, q);
});
app.listen(8080);
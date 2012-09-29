var key = "KloQFw7b0NkGEPsbHPBdlnz2VbA76Zmo555EghQ4ru2PpizJqV";
var http = require("http");

function start(response) {
	console.log("start() called");
	response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello there. Try /pull");
    response.end();
}

function pull(response, tag) {
	if (typeof tag == "undefined") tag = 'dog';

	//Callback because wtf node
	function httpCallback(res, response)
	{
		var pageData = "";
		res.setEncoding('utf8');
		res.on('data', function(chunk)
		{
			pageData += chunk;
			//console.log('body: ' + chunk);
		});
		
		res.on('end', function()
		{
			response.writeHead(200, {"Content-Type": "text/plain"});
			response.write(pageData);
			response.end();
		});

		console.log("Got response: " + res.statusCode);	
	}

	tag = tag.replace(/"/g, '');

	var options = {
		host: 'api.tumblr.com',
		path: '/v2/tagged?tag=' + tag + '&api_key=' + key
	};

	console.log(options.path);

	var req = http.get(options, function(res)
		{
			httpCallback(res, response);
		});

	req.on('error', function(e) {
		console.log('error: ' + e.message);
	});
}

exports.start = start;
exports.pull = pull;
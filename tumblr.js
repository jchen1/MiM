var key = "KloQFw7b0NkGEPsbHPBdlnz2VbA76Zmo555EghQ4ru2PpizJqV";
var http = require("http");

function pull(tag) {
	http.get("http://api.tumblr.com/v2/tagged?tag=" + tag + "&api_key=" + key, function(res) 
	{
		var pageData = "";
		res.setEncoding('utf8');
		res.on('data', function(chunk)
		{
			console.log('body: ' + chunk);
		});
		/*
		res.on('end', function()
		{
			response.send(pageData);
		});

		console.log("Got response: " + res.statusCode);*/
	});
}

exports.pull = pull;


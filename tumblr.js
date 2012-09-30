var key = "KloQFw7b0NkGEPsbHPBdlnz2VbA76Zmo555EghQ4ru2PpizJqV";
var http = require("http");

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
			parseJSON(response, pageData);
		});

		console.log("Got response: " + res.statusCode);	
	}

	tag = tag.replace(/"/g, '');

	var options = {
		host: 'api.tumblr.com',
		path: '/v2/tagged?tag=' + tag + '&api_key=' + key
	};

	var req = http.get(options, function(res)
		{
			httpCallback(res, response);
		});

	req.on('error', function(e) {
		console.log('error: ' + e.message);
	});
}

function parseJSON(response, data)
{
	response.writeHead(200, {"Content-Type": "text/plain"});
	var JSONData = JSON.parse(data);
	for (i = 0; i < JSONData.response.length; i++)
	{
		if (typeof JSONData.response[i].photos != 'undefined')
		{
			var photos = JSONData.response[i].photos;
			var max = 0;
			for (j = 1; j < photos.length; j++)
			{
				if (photos[j].original_size.width > photos[max].original_size.width) max = j;
			}
			response.write('url of ' + i + ' : ' + photos[max].original_size.url + '\n');
		}
		else response.write(i + ' is not an image\n');
	}
	//console.log(JSONData.response[1].photos);
	//console.log(JSONData);
    response.end();
}

exports.pull = pull;
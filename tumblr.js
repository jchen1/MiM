var key = "KloQFw7b0NkGEPsbHPBdlnz2VbA76Zmo555EghQ4ru2PpizJqV";
var http = require("http");

function pull(response, tag) {
	if (typeof tag == "undefined") tag = 'dog';
	var timestamp = 0;

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
		path: '/v2/tagged?tag=' + tag + '&api_key=' + key + '&timestamp=' + timestamp
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
	console.log(JSONData);
	for (i = 0; i < JSONData.response.length; i++)
	{
		if (typeof JSONData.response[i].photos != 'undefined')
		{
			var photos = JSONData.response[i].photos;
			var min = 0;
			if (typeof photos[0].alt_sizes === 'undefined')
			{
				response.write('url of ' + i + ' : ' + photos[0].original_size.url + '\n');
			}
			for (j = 1; j < photos[0].alt_sizes.length; j++)
			{
				if (photos[0].alt_sizes[j].width < photos[0].alt_sizes[min].width) min = j;
			}
			response.write('url of ' + i + ' : ' + photos[0].alt_sizes[min].url + '\n');
		}
		else response.write(i + ' is not an image\n');
	}
	response.write('\nearliest timestamp: ' + JSONData.response[JSONData.response.length - 1].timestamp);
    response.end();
}

exports.pull = pull;
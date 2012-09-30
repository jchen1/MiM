var taggedphoto = require("./photo");

function tagged(response, tag) {
	taggedphoto.initTagged(tag);

	taggedphoto.on("success", function(taggedphoto)
	{
		console.log("This shouldn't have worked... " + taggedphoto);
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.write(JSON.stringify(taggedphoto));
		response.end();
	});

}

exports.tagged = tagged;
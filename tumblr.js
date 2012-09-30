var taggedphoto = require("./photo");

function tagged(response, tag) {
	//taggedphoto.initTagged(tag);
	taggedphoto.initURL('http://sharkinthedungeon.tumblr.com/post/32415676873/its-like-i-broke-up-with-obama-and-hes-not');
	
	taggedphoto.on("success", function(taggedphoto)
	{
		//console.log("This shouldn't have worked... " + taggedphoto);
		response.writeHead(200, {"Content-Type": "text/plain"});	
		response.write(JSON.stringify(taggedphoto.tiles[0].data));
		response.end();		
	});


	
	taggedphoto.on("f_initURL", function(taggedphoto)
	{
		console.log("lol u fuked up");
		response.write("This post isn't an image.");
	});
	

}

exports.tagged = tagged;
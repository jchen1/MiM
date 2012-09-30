var photo = require("./photo");

function tagged(response, tag) {
	photo.initTagged(tag);
	//photo.initURL('http://sharkinthedungeon.tumblr.com/post/32415676873/its-like-i-broke-up-with-obama-and-hes-not');
	
	photo.on("success", function(photo)
	{
		//console.log("This shouldn't have worked... " + photo);
		response.writeHead(200, {"Content-Type": "text/plain"});	
		response.write(JSON.stringify(photo.tiles[0].data));
		response.end();		
	});


	
	photo.on("f_initURL", function(photo)
	{
		console.log("lol u fuked up");
		response.write("This post isn't an image.");
	});
	

}

function urlpost(response, url) {
	photo.initURL(url);

	photo.on("success", function(photo)
	{
		//console.log("This shouldn't have worked... " + photo);
		response.writeHead(200, {"Content-Type": "text/plain"});	
		response.write(JSON.stringify(photo.tiles[0].data));
		response.end();		
	});


	
	photo.on("f_initURL", function(photo)
	{
		console.log("lol u fuked up");
		response.write("This post isn't an image.");
	});
}

exports.tagged = tagged;
exports.urlpost = urlpost;
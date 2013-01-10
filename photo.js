/*
 * Downloads a photo from tumblr, either with a URL or the first
 * picture of the input tag. Size is width in pixels, 0 is original size
 */

var key = "KloQFw7b0NkGEPsbHPBdlnz2VbA76Zmo555EghQ4ru2PpizJqV";
var util = require("util");
var EventEmitter = require("events").EventEmitter;


var Photo = function(request, size) {
	self = this;

	if (request.search("http://") != -1 && request.search("tumblr.com") != -1)
	{
		console.log("URL request recieved: " + request);
		this.emit("req_URL");
	}
	else if (request.search("^[a-zA-Z0-9#]+$") != -1)
	{
		console.log("Tag request recieved: " + request);
		this.emit("req_tag", request);
	}
	else
	{
		console.log("Error: bad request");
		this.emit("req_bad", request);
	}

	function initTag(tag) {
		
	}

	function initURL(url) {

	}

	//this.url
	//this.size
	//this.data[]
	//this.

	self.on("req_URL", initURL);
	self.on("req_tag", initTag);

};

Photo.prototype = new EventEmitter;

module.exports = Photo;
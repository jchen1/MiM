var key = "KloQFw7b0NkGEPsbHPBdlnz2VbA76Zmo555EghQ4ru2PpizJqV";
var http = require("http");
var util = require("util");
var events = require("events");

var Photo = function() {
	var self = this;
	events.EventEmitter.call(self);

	self.initTagged = function(tag) {
		var photo = {tag:tag, timestamp:0, tags:[], url:'', post_url:'', similar:[]};
		console.log("newTaggedPhoto");
		self.emit("newTaggedPhoto", photo, 1);
	}

	self.initURL = function(url) {
		var photo = {tag:'', timestamp:0, tags:[], url:'', post_url:url, similar:[]};
		console.log("newURLPhoto");
		self.emit("newURLPhoto", photo);
	}

	var _pull = function(photo, limit) {	
		if (typeof photo.tag == "undefined") photo.tag = 'dog';

		photo.tag = photo.tag.replace(/"/g, '');

		var options = {
			host: 'api.tumblr.com',
			path: '/v2/tagged?tag=' + photo.tag + '&api_key=' + key + '&before=' + photo.timestamp + '&limit=' + limit
		};
		var req = http.get(options, function(res)
		{
			var pageData = '';
			res.setEncoding('utf8');
			res.on('data', function(chunk)
			{
				pageData += chunk;
			});
			res.on('end', function()
			{
				if (limit == 1)
				{
					console.log("s_pulledBig");
					self.emit("s_pulledBig", photo, pageData);				
				}
				else 
				{
					console.log("s_pulledSmall");
					self.emit("s_pulledSmall", photo, pageData);					
				}
			})
		});

		req.on('error', function(e) {
			console.log('error: ' + e.message);
		});

	}

	var _parseBig = function(photo, data) {
		var JSONData = JSON.parse(data);
		var json = JSONData.response[0];
		if (json.type === 'photo')
		{
			photo.url = json.photos[0].original_size.url;
			photo.tags = json.tags;
			photo.post_url = json.post_url;
			photo.timestamp = json.timestamp;
			console.log("parsedBig 20");
			self.emit("parsedBig", photo, 20);
		}
		else
		{
			photo.timestamp = json.timestamp - 1;
			console.log("parsedBig 1");
			self.emit("parsedBig", photo, 1);
		}
	}

	var _parseSmall = function(photo, data) {
		var JSONData = JSON.parse(data);
		for (i = 0; i < JSONData.response.lengh; i++)
		{
			if (JSONData.response[i].type === 'photo')
			{
				var simpic = {};
				simpic.tags = JSONData.response[i].tags;
				simpic.post_url = JSONData.response[i].post_url;
				simpic.timestamp = JSONData.response[i].timestamp;
				var min = 0;
				for (j = 1; j < JSONData.response[i].photos.alt_sizes.length; j++)
				{
					if (JSONData.response[i].photos.alt_sizes[j].width < JSONData.response[i].photos.alt_sizes[j].width) min = j;
				}
				simpic.url = JSONData.response[i].photos.alt_sizes[min].url;
				photo.similar[photo.similar.length] = simpic;
			}
		}
		console.log("parsedSmall");
		self.emit("parsedSmall", photo);
		
	}

	var _mosaic = function(photo) {
		console.log("mosaiced");
		self.emit("mosaiced", photo);
	}

	var _success = function(photo) {
		console.log("success");
		self.emit("success", photo);
	}

	self.on("newTaggedPhoto", _pull);
	self.on("s_pulledBig", _parseBig);
	self.on("parsedBig", _pull);
	self.on("s_pulledSmall", _parseSmall);
	self.on("parsedSmall", _mosaic);
	self.on("mosaiced", _success);
}

util.inherits(Photo, events.EventEmitter);
module.exports = new Photo();

var key = "KloQFw7b0NkGEPsbHPBdlnz2VbA76Zmo555EghQ4ru2PpizJqV";
var http = require("http");
var util = require("util");
var events = require("events");
var url = require("url");
var querystring = require("querystring");

var Photo = function() {
	var self = this;
	var lastlength = 0;
	events.EventEmitter.call(self);

	self.initTagged = function(tag) {
		var photo = {tag:tag, data:[], timestamp:0, tags:[], url:'', post_url:'', tiles:[]};
		console.log("newTaggedPhoto");
		self.emit("newTaggedPhoto", photo, 1);
	}
/*
	self.initURL = function(link) {
		var photo = {tag:'', timestamp:0, tags:[], url:'', post_url:link, tiles:[]};

		var host = photo.post_url.replace('http://', '').split('/')[0];
		var pathName = url.parse(photo.post_url).pathname;
		var id = pathName.split('/')[2];;

		console.log(host);

		var options = {
			host: 'api.tumblr.com',
			path: 'v2/blog/' + host + '/posts?id=' + id + '&api_key=' + key
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
				var JSONData = JSON.parse(pageData);
				if (JSONData.response.posts[0].type === 'photo')
				{
					photo.url = JSONData.response.posts[0].photos[0].original_size.url;
					photo.tags = JSONData.response.posts[0].photos[0].tags;
					photo.tag = (photo.tags.length > 0 ? photo.tags[0] : '');
					photo.post_url = JSONData.response.posts[0].photos[0].post_url;
					photo.timestamp = JSONData.response.posts[0].photos[0].timestamp;
					photo.data = []; //hi rolando
					console.log("parsedBig 20");
					self.emit("parsedBig", photo, 20);
				}
				else
				{
					self.emit("f_initURL", photo);
				}
			});
		});

		console.log("newURLPhoto");
		//self.emit("newURLPhoto", photo);
	}*/

	var _pull = function(photo, limit) {	
		if (typeof photo.tag == "undefined") photo.tag = 'dog';

		photo.tag = photo.tag.replace(/"/g, '');

		var options = {
			host: 'api.tumblr.com',
			path: '/v2/tagged?tag=' + photo.tag + '&api_key=' + key + '&before=' + (photo.tiles.length === 0 ? photo.timestamp: photo.tiles[photo.tiles.length - 1].timestamp) + '&limit=' + limit
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
			photo.data = []; //hi rolando
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

	var _getColorBig = function(photo, width, height){
		var tilesDown = height/tHeight;
		var tilesRight = width/tWidth;

		var avgColors = [];
		var c = 0;
		
		for(var y = 0; y < tilesDown; y = y + tHeight){
			for(var x = 0; x < tilesRight; x = x + tWidth){
				avgColors[c] = _average(photo, x, y, width, height); //idk look up array specs
				c++;
			}
		}
		return avgColors;
	}

	var _getColorLil = function(photo, width, height){
		var avgColor = _average(photo, 0, 0, width, height);
		return avgColor;
	}
	var _average = function(photo, x, y, width, height) {
		var total = 0;
		for(var j = y; j < y + height; j++){
			for(var i= x; i < x + width; i++){
				total = total + photo.tiles[j * width + i].data[j * width + i];
			}
		}
		return (total/(width*height));
	}

	var _parseSmall = function(photo, data) {
		var JSONData = JSON.parse(data);
		for (i = 0; i < JSONData.response.length; i++)
		{
			if (JSONData.response[i].type === 'photo')
			{
				var simpic = {};
				simpic.tags = JSONData.response[i].tags;
				simpic.post_url = JSONData.response[i].post_url;
				if (simpic.post_url === photo.post_url) continue;
				simpic.timestamp = JSONData.response[i].timestamp;
				var min = 0;
				for (j = 1; j < JSONData.response[i].photos[0].alt_sizes.length; j++)
				{
					if (JSONData.response[i].photos[0].alt_sizes[j].width <
						JSONData.response[i].photos[0].alt_sizes[j].width) min = j;
				}
				simpic.url = JSONData.response[i].photos[0].alt_sizes[min].url;
				simpic.data = []; //hi rolando
				photo.tiles[photo.tiles.length] = simpic;
			}
		}
		console.log("parsedSmall " + photo.tiles.length);
		self.emit("parsedSmall", photo);
		
	}

	var _mosaic = function(photo) {
		console.log("mosaiced");
		if (photo.tiles.length < 400 && lastlength != photo.tiles.length)
		{
			lastlength = photo.tiles.length;
			self.emit("moreTiles", photo, 20);
		}
		else
		{
			self.emit("mosaiced", photo);
		}
	}

	var _success = function(photo) {
		console.log("success");
		self.emit("success", photo);
	}

	self.on("newURLPhoto", self.initTagged);
	self.on("newTaggedPhoto", _pull);
	self.on("s_pulledBig", _parseBig);
	self.on("parsedBig", _pull);
	self.on("s_pulledSmall", _parseSmall);
	self.on("parsedSmall", _mosaic);
	self.on("moreTiles", _pull);
	self.on("mosaiced", _success);

}

util.inherits(Photo, events.EventEmitter);
module.exports = new Photo();

var key = "KloQFw7b0NkGEPsbHPBdlnz2VbA76Zmo555EghQ4ru2PpizJqV";
var http = require("http");
var util = require("util");
var events = require("events");
var url = require("url");
var gm = require('gm');
var PNG = require('png-js');
var fs = require('fs');

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
					self.emit("s_pulledBig", photo, JSON.parse(pageData));				
				}
				else 
				{
					console.log("s_pulledSmall");
					self.emit("s_pulledSmall", photo, JSON.parse(pageData));					
				}
			})
		});

		req.on('error', function(e) {
			console.log('error: ' + e.message);
		});

	}

	var _parseBig = function(photo, data) {
		var json = data.response[0];
		if (json.type === 'photo')
		{
			photo.url = json.photos[0].original_size.url;
			photo.tags = json.tags;
			photo.post_url = json.post_url;
			photo.timestamp = json.timestamp;
			photo.data = []; //hi rolando
			console.log("parsedBig 20");
			self.emit("parsedBig", photo, function(pixels)
			{
				photo.data = pixels;
			});
			console.log(photo.data.length);
		}
		else
		{
			photo.timestamp = json.timestamp - 1;
			console.log("parsedBig 1");
			//self.emit("parsedBig", photo);
		}
	}

	var _downloadBig = function(photo, callback) {
		photo.url = 'http://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png';

		var fileName = 'tmp/'+url.parse(photo.url).pathname.split('/').pop();
		
		var req = http.get(photo.url, function(res)
		{
			var imgData = '';
			res.setEncoding('binary');
			res.on('data', function(chunk)
			{
				imgData += chunk;
			});
			res.on('end', function()
			{
				fs.writeFileSync(fileName, imgData, 'binary');
				gm(fileName).size(function(err, size)
				{
					try {
						PNG.decode(fileName, function(pixels)
						{
							self.emit("downloadedBig", photo, pixels);
							//console.log(photo.data.length);
						});
					} catch (err) {
						console.log('you fucked up: ' + err);
					}
				});
			});
		});


		req.on('error', function(e) {
			console.log('error: ' + e.message);
		});
	}

	var _storeBigImage = function(photo, pixels) {
		photo.data = pixels;
		
	}

	var _parseSmall = function(photo, data) {
		for (i = 0; i < data.response.length; i++)
		{
			if (data.response[i].type === 'photo')
			{
				var simpic = {};
				simpic.tags = data.response[i].tags;
				simpic.post_url = data.response[i].post_url;
				if (simpic.post_url === photo.post_url) continue;
				simpic.timestamp = data.response[i].timestamp;
				var min = 0;
				for (j = 1; j < data.response[i].photos[0].alt_sizes.length; j++)
				{
					if (data.response[i].photos[0].alt_sizes[j].width <
						data.response[i].photos[0].alt_sizes[j].width) min = j;
				}
				simpic.url = data.response[i].photos[0].alt_sizes[min].url;
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
	self.on("parsedBig", _downloadBig);
	self.on("s_pulledSmall", _parseSmall);
	self.on("parsedSmall", _mosaic);
	self.on("moreTiles", _pull);
	self.on("mosaiced", _success);
	self.on("downloadedBig", _storeBigImage);

}

util.inherits(Photo, events.EventEmitter);
module.exports = new Photo();

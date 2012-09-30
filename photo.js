var key = "KloQFw7b0NkGEPsbHPBdlnz2VbA76Zmo555EghQ4ru2PpizJqV";
var http = require("http");
var util = require("util");
var events = require("events");
var url = require("url");
var gm = require('gm');
var PNG = require('png-js');
var fs = require('fs');
var easyimg = require('easyimage');
var Canvas = require('canvas')
	, s_canvas = new Canvas(25, 25)
	, s_ctx = s_canvas.getContext('2d')
  , Image = Canvas.Image;

var Photo = function() {
	var self = this;
	var lastlength = 0;
	events.EventEmitter.call(self);

	self.initTagged = function(tag) {
		var photo = {tag:tag, width:0, height:0, data:[], t_index:0, timestamp:0, tags:[], url:'', post_url:'', tiles:[]};
		//console.log("newTaggedPhoto");
		self.emit("newTaggedPhoto", photo, 1);
	}

	self.initURL = function(link) {
		var photo = {tag:'', t_index:0, width:0, height:0, timestamp:0, tags:[], url:'', post_url:link, tiles:[]};

		var host = photo.post_url.replace('http://', '').split('/')[0];
		var pathName = url.parse(photo.post_url).pathname;
		var id = pathName.split('/')[2];

		var path = '/v2/blog/' + host + '/posts?id=' + id + '&api_key=' + key;

		console.log(path);

		var options = {
			host: 'api.tumblr.com',
			path: '/v2/blog/' + host + '/posts?id=' + id + '&api_key=' + key
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
				if (JSONData.response.posts[0].type === 'photo' && JSONData.response.posts[0].photos[0].original_size.url.indexOf('.gif') == -1)
				{
					photo.url = JSONData.response.posts[0].photos[0].original_size.url;
					photo.tags = JSONData.response.posts[0].photos[0].tags;
					photo.tag = (typeof JSONData.response.posts[0].photos[0].tags != 'undefined' ? JSONData.response.posts[0].photo[0].tags[0] :
						typeof JSONData.response.posts[0].photos[0].featured_in_tag != 'undefined' ? JSONData.response.posts[0].photos[0].featured_in_tag[0] : 'dog');
					photo.post_url = JSONData.response.posts[0].photos[0].post_url;
					photo.timestamp = JSONData.response.posts[0].photos[0].timestamp;
					photo.width = JSONData.response.posts[0].photos[0].original_size.width;
					photo.height = JSONData.response.posts[0].photos[0].original_size.height;
					photo.data = []; //hi rolando
					//console.log("parsedBig 20");
					self.emit("s_parsedBig", photo);
				}
				else
				{
					self.emit("f_initURL", photo);
				}
			});
		});

		//console.log("newURLPhoto");
		//self.emit("s_pulledBig", photo);
	}

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
					//console.log("s_pulledBig");
					self.emit("s_pulledBig", photo, JSON.parse(pageData));				
				}
				else 
				{
					//console.log("s_pulledSmall");
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
		if (json.type === 'photo' && json.photos[0].original_size.url.indexOf('.gif') == -1)
		{
			photo.url = json.photos[0].original_size.url;
			photo.tags = json.tags;
			photo.post_url = json.post_url;
			photo.timestamp = json.timestamp;
			photo.data = []; //hi rolando
			photo.width = json.photos[0].original_size.width;
			photo.height = json.photos[0].original_size.height;
			//console.log("parsedBig 20");
			self.emit("s_parsedBig", photo);
			//console.log(photo.data.length);
		}
		else
		{
			photo.timestamp = json.timestamp - 1;
			//console.log("parsedBig 1");
			self.emit("f_parsedBig", photo, 1);
		}
	}

	var _downloadBig = function(photo) {
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
				var img = new Image;
				img.src = new Buffer(imgData, 'binary');
				canvas = new Canvas(photo.width, photo.height);
				canvas.getContext('2d').drawImage(img, 0, 0, photo.width, photo.height);
				var pixels = canvas.getContext('2d').getImageData(0, 0, photo.width, photo.height);
				self.emit("downloadedBig", photo, pixels);

			});
		});


		req.on('error', function(e) {
			console.log('error: ' + e.message);
		});
	}

	var _storeBigImage = function(photo, pixels) {
		photo.data = pixels;
		self.emit("storedBigImage", photo, 20);
	}

	var _parseSmall = function(photo, data) {
		for (i = 0; i < data.response.length; i++)
		{
			if (data.response[i].type === 'photo' && data.response[i].photos[0].original_size.url.indexOf('.gif') == -1)
			{
				var simpic = {};
				simpic.tags = data.response[i].tags;
				simpic.post_url = data.response[i].post_url;
				if (simpic.post_url === photo.post_url) continue;
				simpic.timestamp = data.response[i].timestamp;
				var min = 0;
				for (j = 1; j < data.response[i].photos[0].alt_sizes.length; j++)
				{
					if (data.response[i].photos[0].alt_sizes[j].width == 75 &&
						data.response[i].photos[0].alt_sizes[j].height == 75) min = j;
				}
				simpic.url = data.response[i].photos[0].alt_sizes[min].url;
				simpic.width = data.response[i].photos[0].alt_sizes[min].width;
				simpic.height = data.response[i].photos[0].alt_sizes[min].height;
				simpic.data = []; //hi rolando
				photo.tiles[photo.tiles.length] = simpic;
			}
		}
		//console.log("parsedSmall " + photo.tiles.length);
		self.emit("parsedSmall", photo);
			
	}

	var _waitforpaths = function(photo) {
		//console.log("mosaiced");
		if (photo.tiles.length < 400 && lastlength != photo.tiles.length)
		{
			lastlength = photo.tiles.length;
			self.emit("moreTiles", photo, 20);
		}
		else
		{
			self.emit("downloadSmall", photo);
			//self.emit("mosaiced", photo);
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

	var _downloadSmall = function(photo) {
		if (photo.t_index >= photo.tiles.length) self.emit("downloadedSmall", photo);
		var tile = photo.tiles[photo.t_index];
		if (typeof tile == 'undefined'){
			self.emit("downloadedSmall", photo);
			return;
		}
		var fileName = 'tmp/' + url.parse(tile.url).pathname.split('/').pop();

		var req = http.get(photo.tiles[photo.t_index].url, function(res)
		{
			var imgData = '';
			res.setEncoding('binary');
			res.on('data', function(chunk)
			{
				imgData += chunk;
			});
			res.on('end', function()
			{
				var img = new Image;
				img.src = new Buffer(imgData, 'binary');
				s_ctx.drawImage(img, 0, 0, 25, 25);
				pixels = s_ctx.getImageData(0, 0, 25, 25);
				self.emit("storeSmallImage", photo, pixels)
			});
		});


		req.on('error', function(e) {
			console.log('error: ' + e.message);
		});
	}

	var _storeSmallImage = function(photo, pixels) {
		photo.tiles[photo.t_index].data = pixels;
		//if (!(photo.t_index % 100)) console.log('stored index ' + photo.t_index + ' with size ' + photo.tiles[photo.t_index].data.data.length);
		photo.t_index++;

		self.emit("downloadSmall", photo);	
	}


	var _success = function(photo) {
		console.log("success");
		self.emit("success", photo);
	}

	self.on("newURLPhoto", self.initTagged);
	self.on("newTaggedPhoto", _pull);
	self.on("s_pulledBig", _parseBig);
	self.on("s_parsedBig", _downloadBig);
	self.on("f_parsedBig", _pull);
	self.on("s_pulledSmall", _parseSmall);
	self.on("parsedSmall", _waitforpaths);
	self.on("moreTiles", _pull);
	self.on("downloadedSmall", _success);
	self.on("downloadedBig", _storeBigImage);
	self.on("storedBigImage", _pull);

	self.on("downloadSmall", _downloadSmall);
	self.on("storeSmallImage", _storeSmallImage);

}

util.inherits(Photo, events.EventEmitter);
module.exports = new Photo();
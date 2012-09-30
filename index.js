var static = require('node-static');
var file = new(static.Server);

require('http').createServer(function(request, response) {
    request.addListener('end', function() {
	fileName = '.' + request.url;
	if (fileName == './')
	    file.serveFile('./templates/main.html', 200, {}, request, response);
	else if (fileName.substr(0, 8) == './assets')
	    file.serve(request, response);
    });
}).listen(8080);

var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var tumblr = require("./tumblr");
var gm = require('gm');
var PNG = require('png-js');


//start download of mosaic
var sys = require("sys"),
http = require("http"),
url = require("url"),
path = require("path"),
fs = require("fs"),
events = require("events");


function bigImageProcess(imageurl, callback){
    var downloadfile = "http://24.media.tumblr.com/tumblr_mb4qh0ZU1j1r0wqrdo1_500.png";

    var host = url.parse(downloadfile).hostname
    var filename = "tmp/"+url.parse(downloadfile).pathname.split("/").pop()

    var theurl = http.createClient(80, host);
    var requestUrl = downloadfile;
    console.log("Downloading file: " + filename);
    console.log("Before download request");
    var request = theurl.request('GET', requestUrl, {"host": host});
    request.end();


    var pixelbuffer = null;
    request.addListener('response', function (response) {
	response.setEncoding('binary')
	console.log("File size: " + response.headers['content-length'] + " bytes.")
	var body = '';
	response.on('data', function (chunk) {
        body += chunk;
	});
	response.on("end", function() {
        fs.writeFileSync(filename, body, 'binary');
        console.log("Download Complete");
	    console.log(filename);
	    gm(filename).size(function (err,size){
			console.log(err);
			console.log(size.width);
			console.log(size.height);
			gm(filename)
		    	.scale(size.width/2, size.height/2)
		    	.write('bigImages/largeMosaic.png', function (err){
					console.log(size.width);
					try {
			    		PNG.decode(filename, function(pixels){
							pixelbuffer = pixels;
							callback(null, pixels); //<<---- that shit returns the pixel array of the big image
						});
		    		}
			   		catch( err ) {
			    		console.log('error: ' + err)
			   		}
			  	});
			});
		});
	});
}
//end big image process

//start small image process
function smallImageProcess(imageurl, callback){
    var downloadfile = "http://24.media.tumblr.com/tumblr_mb4qh0ZU1j1r0wqrdo1_500.png";

    var host = url.parse(downloadfile).hostname
    var filename = "tmp/"+url.parse(downloadfile).pathname.split("/").pop()

    var theurl = http.createClient(80, host);
    var requestUrl = downloadfile;
    console.log("Downloading file: " + filename);
    console.log("Before download request");
    var request = theurl.request('GET', requestUrl, {"host": host});
    request.end();

    var dlprogress = 0;


//setInterval(function () {
//    console.log("Download progress: " + dlprogress + " bytes");
//}, 1000);

//function (callback)

    var pixelbuffer = null;
    request.addListener('response', function (response) {
	response.setEncoding('binary')
	console.log("File size: " + response.headers['content-length'] + " bytes.")
	var body = '';
	response.addListener('data', function (chunk) {
            dlprogress += chunk.length;
            body += chunk;
	});
	response.addListener("end", function() {
            fs.writeFileSync(filename, body, 'binary');
            console.log("Download Complete");
	    console.log(filename);
	    gm(filename).size(function (err,size){
		console.log(err);
		console.log(size.width);
		console.log(size.height);
		gm(filename)
		    .scale(1, 1) //scale for pixel average (might need to find better algorithm)
		    .write('smallImages/smallMosaic.png', function (err){
			console.log(size.width);
			try {
			    PNG.decode(filename, function(pixels){
				pixelbuffer = pixels;
				    //for(var i = 0; i < size.width/2*size.height/2; i++){
				//console.log(pixels[i]);
				callback(null, pixels);
				      });
		    }
			   catch( err ) {
			       console.log('error: '+err)
			   }
			  });
			     });
			    });
		       });
}
//end small image process




/*
function quadSummary(imageurl, callback){
//body all vars
}

bigImageProcess(tumblr, function(err, pixels){
    smallImageProcess(tumblr2, function(err, pixels2)
    for(var i = 0; i < pixels%3; i++){
    if(pixels[i]-ixels2[0] && pixels[i+1]==pixels2[1] && pixels[i+2]==pixels2[2]){
    i++;
    i++;
    }
    }


    })
*/

//.size(on_size)

//function on_size(data){
//    other(on_other)
//}

//function on_other(){

//}

//end download

//download mosiac pieces




//end download mosaic pieces

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'image/png' });
    res.end(pixelbuffer, 'binary');
}).listen(9000);

var handle = {}
//handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/tagged"] = tumblr.tagged;



server.start(router.route, handle);
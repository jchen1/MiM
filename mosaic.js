/*
 * Makes mosaic of a given photo.
 */

var Photo = require('./photo');
var EventEmitter = require('events').EventEmitter;

var Mosaic = function(photo) {
	/*
	 * break up photo into squares
	 * find average pixel value of squares
	 * get small images
	 * find average pixel value of small images
	 * match images and squares
	 * recolorize images to match squares
	 * return array of small images in order
	 */
}


Mosaic.prototype = new EventEmitter;
module.exports = Mosaic;
function squared(thing) {
	return thing * thing;
}

function calcTolerance(source, target) {
	// source is array of R, G, B
	// target is array of R, G, B
	return squared(Math.abs(source[0] - target[0])) + squared(Math.abs(source[1] - target[1])) + squared(Math.abs(source[2] - target[2]));
}

function doMatching(partitionedBigImage, arrayOfTiles, arrayOfTileUrls) {
// Takes in:
// partitionedBigImage: [region1 red, region1 green, region1 blue,
//		region2 red, region2 green, region2 blue, ...]
// arrayOfTiles: [[tile1 red, tile1 green, tile1 blue],
//		[tile2 red, tile2 green, tile2 blue], ...]
// arrayOfTileUrls: [tile1 url, tile2 url, tile3 url, ...]
// Spits out:
// best_tileurls: [region1 best tile url, region2 best tile url,
//		region3 best tile url, ...]
	var best_tileids = new Array();
	// loop through each region of the big image
	for (var regionid = 0; regionid < partitionedBigImage.length; regionid++) {
		var min_tolerance = Infinity;
		// look through each tile
		for (var tileid = 0; tileid < arrayOfTiles.length; tileid++) {
			var region = partitionedBigImage.slice(3*j, 3*j +3);
			var tolerance = calcTolerance(region, arrayOfTiles[tileid]);
			if (tolerance < min_tolerance) {
				best_tileids[region] = tileid;
				min_tolerance = tolerance;
			}
		}
	}
	var best_tileurls = new Array();
	for (var regionid = 0; regionid < best_tileids.length; regionid++) {
		best_tileurls[regionid] = arrayOfTileUrls[best_tileids[regionid]];
	}
	return best_tileurls;
}
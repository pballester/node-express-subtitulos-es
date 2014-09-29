var mdb = require('moviedb')(process.env.API_KEY),
	debug = require('debug')('node-express-subtitulos-es'),
	POSTER_SIZE = 2;

function getConfiguration(posterSize, callback) {
	mdb.configuration(function(err, configRes) {
		var configObject = {
			base_url: configRes["images"]["base_url"],
			poster_size: configRes["images"]["poster_sizes"][posterSize]
		};
		callback(configObject);
	});
}

/**
 * Get tvShow poster url or "default"
 * @param  {String}   tvShowName 
 * @param  {Function} callback
 * @return {String}
 */
exports.getTvShowPosterUrl = function(tvShowName, callback) {
	getConfiguration(POSTER_SIZE, function(configObject) {
		debug("Searching poster for tvShow: " + tvShowName);
		mdb.searchTv({query: tvShowName }, function(err, res){
			var hasResults = res.results.length > 0,
				img = "default";
			if (hasResults) {
				debug("Poster for tvShow " + res.results[0].name + " found!");
				img = configObject.base_url + configObject.poster_size + res.results[0].poster_path;
			}
			else {
				debug("Poster for tvShow " + tvShowName + " not found :'(");
			}
			callback(img);
		});
	});
}
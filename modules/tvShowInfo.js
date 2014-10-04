var mdb = require('moviedb')(process.env.API_KEY),
	debug = require('debug')('node-express-subtitulos-es'),
	request = require('request'),
	cheerio = require('cheerio'),
	POSTER_SIZE = 2;

function getConfiguration(posterSize, callback) {
	mdb.configuration(function(err, configRes) {
		if (err) {
			debug("Error getting configuration from TMDB :'(");
			setTimeout(function() {
				getConfiguration(posterSize, callback);
			},1000);
			return;
		}
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
 * @param  {Function} callback function with the poster url as parameter
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

/**
 * Gets the tvShow list
 * @param  {Function} callback function with the tvShow list object as a parameter
 */
exports.getTvShowList = function(callback) {
	var url = "http://www.subtitulos.es/series",
		re = /\/(\d{1,})/,
		tvShowsArray = [],
		$, tvShows, reResult, tvShowId;

	request(url, function(err, resp, body) {
		$ = cheerio.load(body);
		tvShows = $("a", "#showindex");
		for (i = 0; i < tvShows.length; i++) {
			reResult = re.exec(cheerio(tvShows[i]).attr("href"));
			if (reResult !== null) {
				tvShowId = reResult[1];
				tvShowObject = {
					title: cheerio(tvShows[i]).text(),
					href: tvShowId
				};
				tvShowsArray.push(tvShowObject);
			}
		}
		callback(tvShowsArray);
	});
}
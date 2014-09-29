var mdb = require('moviedb')(process.env.API_KEY),
	debug = require('debug')('node-express-subtitulos-es'),
	async = require('async');

exports.test = function(req, response) {
	var tvShowList = ["Supernatural", "Fargo", "Utopia", "two broke girls", "the strain", "twin peaks", "dexter", "new girl", "american horror"],
		downloadCounter = 0,
		tvShowPosters = [];

	async.series({
		getTvShowPosterUrl: getTvShowPosterUrl,
		renderView: renderView
	});

	function getTvShowPosterUrl(callback) {
		mdb.configuration(function(err, configRes) {
			for (var i = tvShowList.length - 1; i >= 0; i--) {
				debug("Searching poster for tvShow: " + tvShowList[i]);
				mdb.searchTv({query: tvShowList[i] }, function(err, res){
					var hasResults = res.results.length > 0,
						img = "default";
					if (hasResults) {
						debug("Poster for tvShow " + res.results[0].name + " found!");
						img = configRes["images"]["base_url"] + configRes["images"]["poster_sizes"][2] + res.results[0].poster_path;
					}
					tvShowPosters.push(img);
					downloadCounter++;
					if (downloadCounter === tvShowList.length) {
						callback(null);
					}
				});
			};
		});
	}

	function renderView(callback) {
		response.render('test', {
			imgs: tvShowPosters
		});
		callback(null);
	}
};

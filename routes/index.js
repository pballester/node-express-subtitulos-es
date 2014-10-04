var request = require('request'),
	tvShowInfo = require("../modules/tvShowInfo"),
	cheerio = require('cheerio');

exports.index = function(req, res) {
	var objectLanguages = [{
			name: "Español (España)",
			value: "esp"
		}, {
			name: "Español (Latinoamérica)",
			value: "lat"
		}, {
			name: "English",
			value: "eng"
		}];

	tvShowInfo.getTvShowList(function(tvShowsArray) {
		res.render('index', {
			title: "tvShow Subtitle Searcher",
			tvShows: tvShowsArray,
			languages: objectLanguages
		});
	});
};
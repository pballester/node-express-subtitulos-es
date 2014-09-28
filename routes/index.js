var request = require('request'),
	cheerio = require('cheerio');

exports.index = function(req, res) {
	var url = "http://www.subtitulos.es/series",
		re = /\/(\d{1,})/,
		objectLanguages = [{
			name: "Español (España)",
			value: "esp"
		}, {
			name: "Español (Latinoamérica)",
			value: "lat"
		}, {
			name: "English",
			value: "eng"
		}],
		tvShowsArray = [],
		$, tvShows, i, tvShowObject, tvShowId, reResult;
	//Get the subtitulos.es tvshows list and pass it to a template
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
		res.render('index', {
			title: "tvShow Subtitle Searcher",
			tvShows: tvShowsArray,
			languages: objectLanguages
		});
	});
};
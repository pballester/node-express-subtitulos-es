var mdb = require('moviedb')(process.env.API_KEY),
	debug = require('debug')('node-express-subtitulos-es'),
	request = require('request'),
	cheerio = require('cheerio'),
	POSTER_SIZE = 2;

/**
 * Gets config object of TMDB
 * @param  {INT}   posterSize Poster size
 * @param  {Function} callback   callback function with the poster url as parameter
 */
function getConfiguration(posterSize, callback) {
	mdb.configuration(function(err, configRes) {
		if (err) {
			debug("Error getting configuration from TMDB :'(");
			setTimeout(function() {
				getConfiguration(posterSize, callback);
			}, 1000);
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
 * Gets tvShow poster url or "default"
 * @param  {String}   tvShowName
 * @param  {Function} callback function with the poster url as parameter
 */
exports.getTvShowPosterUrl = function(tvShowName, callback) {
	getConfiguration(POSTER_SIZE, function(configObject) {
		debug("Searching poster for tvShow: " + tvShowName);
		mdb.searchTv({
			query: tvShowName
		}, function(err, res) {
			var hasResults = res.results.length > 0,
				img = "default";
			if (hasResults) {
				debug("Poster for tvShow " + res.results[0].name + " found!");
				img = configObject.base_url + configObject.poster_size + res.results[0].poster_path;
			} else {
				debug("Poster for tvShow " + tvShowName + " not found :'(");
			}
			callback(img);
		});
	});
}

/**
 * Gets the tvShow list
 * @param  {Function} callback function with the tvShow list object as parameter
 */
exports.getTvShowList = function(callback) {
	var url = "http://www.subtitulos.es/series",
		reId = /\/(\d{1,})/,
		reRemoveparenthesis = /(\(.*\))/g,
		tvShowsArray = [],
		$, tvShows, reIdResult, tvShowId;

	request(url, function(err, resp, body) {
		$ = cheerio.load(body);
		tvShows = $("a", "#showindex");
		for (i = 0; i < tvShows.length; i++) {
			reIdResult = reId.exec(cheerio(tvShows[i]).attr("href"));
			if (reIdResult !== null) {
				tvShowId = reIdResult[1];
				tvShowObject = {
					title: cheerio(tvShows[i]).text().replace(reRemoveparenthesis, ''),
					href: tvShowId
				};
				tvShowsArray.push(tvShowObject);
			}
		}
		callback(tvShowsArray);
	});
}

/**
 * Gets tvShow seasons number
 * @param  {Integer}   tvShowId
 * @param  {Function} callback function with de number of season as parameter or null
 */
exports.getTvShowSeasons = function(tvShowId, callback) {
	var urlToGetSeasons = "http://www.subtitulos.es/show/" + tvShowId,
		reSeason = /\,(\d{1,})\)/,
		reResult, $;

	debug("Searching seasons for tvShow: " + tvShowId);
	request(urlToGetSeasons, function(err, resp, body) {
		if (err) {
			debug("Conection error");
			callback(null);
			return;
		}
		$ = cheerio.load(body);
		reResult = reSeason.exec($("body").attr("onload"));
		if (reResult !== null) {
			seasons = reResult[1];
			debug("Found " + seasons + " seasons for tvShow: " + tvShowId);
			callback(seasons);
			return;
		}
		callback(null);
	});
}

/**
 * Gets subtitle list
 * @param  {Integer}   tvShowId
 * @param  {Integer}   tvShowSeason
 * @param  {String}    lang
 * @param  {Function} callback function with the subtitle list as parameter
 */
exports.getSubtitleFiles = function(tvShowId, tvShowSeason, lang, callback) {
	var urlToGetDownloads = "http://www.subtitulos.es/ajax_loadShow.php?show=" + tvShowId + "&season=" + tvShowSeason,
		arrayFilesToDownload = [],
		reLang = /^Español \(España\)$|^Español$/,
		objectLanguages = [{
			value: "esp",
			regExp: /^Español \(España\)$|^Español$/
		}, {
			value: "lat",
			regExp: /^Español \(Latinoamérica\)$|^Español$/
		}, {
			value: "eng",
			regExp: /^English$|^English \(US\)$/
		}],
		languageDomObjects, fileDownloadObject;

	request(urlToGetDownloads, function(err, resp, body) {
		if (err) {
			debug("Conection error");
			callback(arrayFilesToDownload);
			return;
		}
		for (i = 0; i < objectLanguages.length; i++) {
			if (objectLanguages[i].value === lang) {
				reLang = objectLanguages[i].regExp;
				debug("Selected languange : " + reLang);
				break;
			}
		}
		$ = cheerio.load(body);
		languageDomObjects = $(".language");
		for (i = 0; i < languageDomObjects.length; i++) {
			if (reLang.test(cheerio(languageDomObjects[i]).text().trim()) && cheerio(languageDomObjects[i]).parent().find("a").length > 0) {
				fileDownloadObject = {
					url: cheerio(languageDomObjects[i]).parent().find("a").attr("href"),
					version: cheerio(languageDomObjects[i]).parent().prevAll().filter(function() {
						return cheerio(this).children("td.newsClaro[colspan=3]").length > 0
					}).first().text().trim()
				}
				arrayFilesToDownload.push(fileDownloadObject);
			}
		}
		debug("Found " + arrayFilesToDownload.length + " subtitles for tvShow: " + tvShowId);
		callback(arrayFilesToDownload);
	});
}
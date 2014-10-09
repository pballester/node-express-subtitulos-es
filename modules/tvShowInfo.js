var debug = require('debug')('node-express-subtitulos-es'),
	request = require('request'),
	cheerio = require('cheerio');

/**
 * Gets tvShow seasons number
 * @param  {Integer}   tvShowId
 * @param  {Function} callback function with de number of season as parameter or null
 */
getTvShowSeasons = function(tvShowId, tvShowObject, callback) {
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
			callback(tvShowObject, seasons);
			return;
		}
		callback(null);
	});
}

/**
 * Gets the tvShow list
 * @param  {Function} callback function with the tvShow list object as parameter
 */
exports.getTvShowList = function(ini, fin, callback) {
	var url = "http://www.subtitulos.es/series",
		reId = /\/(\d{1,})/,
		tvShowsArray = [],
		counter = 0,
		$, tvShows, reIdResult, tvShowId;

	ini = ini || 0;

	request(url, function(err, resp, body) {
		$ = cheerio.load(body);
		tvShows = $("a", "#showindex");

		fin = fin || tvShows.length;
		ini = ini > fin ? 0 : ini;
		ini = ini > tvShows.length ? 0 : ini;
		fin = fin > tvShows.length ? tvShows.length : fin;

		if (ini === fin) {
			callback(tvShowsArray);
		}
		for (i = ini; i < fin; i++) {
			reIdResult = reId.exec(cheerio(tvShows[i]).attr("href"));
			if (reIdResult !== null) {
				tvShowId = reIdResult[1];
				tvShowObject = {
					title: cheerio(tvShows[i]).text(),
					id: tvShowId
				};
				getTvShowSeasons(tvShowObject.id, tvShowObject, function(tvShowObject, seasons) {
					counter++;
					tvShowObject.seasons = seasons;
					tvShowsArray.push(tvShowObject);
					if (counter === (fin - ini)) {
						callback(tvShowsArray);
					}
				});
			} else {
				counter++;
			}
		}
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
			callback(null);
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
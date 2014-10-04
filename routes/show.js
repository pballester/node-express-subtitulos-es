var request = require('request'),
	debug = require('debug')('node-express-subtitulos-es'),
	tvShowInfo = require("../modules/tvShowInfo"),
	tvShowDownloader = require("../modules/tvShowDownloader");

exports.show = function(req, res) {
	var arrayFilesToDownload = [],
		downloadCounter = 0,
		reResult, $, seasons, i, zip;

	tvShowInfo.getTvShowSeasons(req.params.id, function(seasonsNumber) {
		seasons = seasonsNumber;
		if (seasons !== null) {
			tvShowInfo.getSubtitleFiles(req.params.id, seasons, req.params.lang, function(filesToDownload) {
				arrayFilesToDownload = filesToDownload;
				if (arrayFilesToDownload.length > 0) {
					tvShowDownloader.downloadSubtitleFiles(arrayFilesToDownload, req.params.id + "-" + seasons, res);
				} else {
					throwError("No subtitles found");
				}
			});
		} else {
			throwError("No seasons found");
		}
	});

	function throwError(msg) {
		var error = new Error(msg);
		debug("ERROR: " + msg);
		res.render('error', {
			message: error.message,
			error: error
		});
	}
};
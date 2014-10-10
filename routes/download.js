var tvShowDownloader = require("../modules/tvShowDownloader"),
	tvShowInfo = require("../modules/tvShowInfo");

exports.download = function(req, res) {
	tvShowInfo.getSubtitleFiles(req.params.id, req.params.season, req.params.lang, function(arrayFilesToDownload) {
		if (arrayFilesToDownload === null || arrayFilesToDownload.length < 1) {
			res.status(500).send({ error: 'No subtitles found' });
		}
		tvShowDownloader.downloadSubtitleFiles(arrayFilesToDownload, "subitles.zip", res);
	});
};
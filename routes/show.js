var request = require('request'),
	debug = require('debug')('node-express-subtitulos-es'),
	cheerio = require('cheerio'),
	async = require('async'),
	path = require('path'),
	fs = require('fs'),
	tvShowInfo = require("../modules/tvShowInfo"),
	admZip = require('adm-zip');

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
					async.series({
						downloadSubtitleFiles: downloadSubtitleFiles,
						createZipFile: createZipFile
					});
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

	function downloadSubtitleFiles(callback) {
		zip = new admZip();
		for (i = 0; i < arrayFilesToDownload.length; i++) {
			downloadSubtitle(arrayFilesToDownload[i].url, arrayFilesToDownload[i].version, callback);
		}
	}

	function downloadSubtitle(url, version, callback) {
		var reFileName = /filename=\"(.*)\"/,
			options, fileName;
		options = {
			url: url,
			headers: {
				"referer": "http://www.subtitulos.es/"
			},
			encoding: "binary"
		};
		request(options, function(err, resp, body) {
			fileName = "";
			if (err) {
				debug("Error downloading subtitle with url: " + options.url + " " + err);
				downloadCounter++;
				return;
			}
			if (resp.headers['content-disposition'] !== null) {
				reResult = reFileName.exec(resp.headers['content-disposition']);
				if (reResult !== null) {
					if (version !== "") {
						fileName = cleanString(reResult[1].split(".")[0] + " - " + version + ".srt");
					} else {
						fileName = cleanString(reResult[1]);
					}
				}
			}
			if (fileName === "") {
				fileName = "unknown-" + (Math.floor(Math.random() * 1000) + 1) + ".srt";
			}
			debug("Subtitle " + fileName + " downloaded");
			downloadCounter++;
			zip.addFile(fileName, new Buffer(body));
			if (downloadCounter === arrayFilesToDownload.length) {
				callback(null);
			}
		});
	}

	function createZipFile(callback) {
		var zipPath;
		zipPath = path.join(res.locals.tmpFolder, req.params.id + "-" + seasons + ".zip");
		zip.writeZip(zipPath);
		debug("Zip archive created in " + zipPath);
		res.download(zipPath, function(err) {
			fs.unlink(zipPath, function(err) {
				if (err) {
					debug("Error deleting the zip file");
					return;
				}
				debug("Zip file deleted");
			});
		});
		callback(null);
	}

	function cleanString(strAccents) {
		var strAccents = strAccents.split(''),
			strAccentsOut = new Array(),
			strAccentsLen = strAccents.length,
			accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽžñÑ',
			accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZznN",
			y;
		for (y = 0; y < strAccentsLen; y++) {
			if (accents.indexOf(strAccents[y]) !== -1) {
				strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
			} else
				strAccentsOut[y] = strAccents[y];
		}
		strAccentsOut = strAccentsOut.join('');
		return strAccentsOut;
	}
};
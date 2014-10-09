var admZip = require('adm-zip'),
	request = require('request'),
	path = require('path'),
	debug = require('debug')('node-express-subtitulos-es'),
	utils = require("./utils"),
	fs = require('fs');

function createAndSendZipFile(zip, zipName, response) {
	var zipPath = path.join(response.locals.tmpFolder, zipName + ".zip");
	zip.writeZip(zipPath);
	debug("Zip archive created in " + zipPath);
	response.download(zipPath, function(err) {
		fs.unlink(zipPath, function(err) {
			if (err) {
				debug("Error deleting the zip file");
				return;
			}
			debug("Zip file deleted");
		});
	});
}

function downloadSubtitle(fileToDownload, zip, total, callback) {
	var reFileName = /filename=\"(.*)\"/,
		options, fileName, reResult;
	options = {
		url: fileToDownload.url,
		headers: {
			"referer": "http://www.subtitulos.es/"
		},
		encoding: "binary"
	};
	request(options, function(err, resp, body) {
		fileName = "";
		if (err) {
			debug("Error downloading subtitle with url: " + options.url + " " + err);
			callback();
		}
		if (resp.headers['content-disposition'] !== null) {
			reResult = reFileName.exec(resp.headers['content-disposition']);
			if (reResult !== null) {
				if (fileToDownload.version !== "") {
					fileName = utils.cleanString(reResult[1].split(".")[0] + " - " + fileToDownload.version + ".srt");
				} else {
					fileName = utils.cleanString(reResult[1]);
				}
			}
		}
		if (fileName === "") {
			fileName = "unknown-" + (Math.floor(Math.random() * 1000) + 1) + ".srt";
		}
		debug("Subtitle " + fileName + " downloaded");
		zip.addFile(fileName, new Buffer(body));
		callback();
	});
}

/**
 * Downloads the subtitles in the array
 * @param  {Array} arrayFilesToDownload
 * @param  {String} zipName
 * @param  {Response} response
 */
exports.downloadSubtitleFiles = function(arrayFilesToDownload, zipName, response) {
	var zip = new admZip(),
		downloadCounter = 0;
	for (i = 0; i < arrayFilesToDownload.length; i++) {
		downloadSubtitle(arrayFilesToDownload[i], zip, arrayFilesToDownload.length, function() {
			downloadCounter++;
			if (downloadCounter === arrayFilesToDownload.length) {
				createAndSendZipFile(zip, zipName, response);
			}
		});
	}
}
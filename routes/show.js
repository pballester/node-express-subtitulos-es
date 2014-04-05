var request = require('request'),
	cheerio = require('cheerio'),
	async = require('async'),
	path = require('path'),
	fs = require('fs'),
	admZip = require('adm-zip');

exports.show = function(req, res){
	var urlToGetSeasons = "http://www.subtitulos.es/show/" + req.params.id,
		reSeason = /\,(\d{1,})\)/,
		//TODO: Spanish language harcoded
		reLang = /Español \(España\)/,
		reFileName = /filename=\"(.*)\"/,
		arrayFilesToDownload = [],
		downloadCounter = 0,
		reResult, $, seasons, error, options, urlToGetDownloads, languageDomObjects, i, fileName, zip, zipPath;
	//Get the seasons of the tvShow
	request(urlToGetSeasons, function(err, resp, body) {
		$ = cheerio.load(body);
		reResult = reSeason.exec($("body").attr("onload"));
		if (reResult !== null) {
			seasons = reResult[1];
			if (seasons !== null) {
			//Get the download page of the subtitles
				urlToGetDownloads = "http://www.subtitulos.es/ajax_loadShow.php?show="+req.params.id+"&season="+seasons;
				options = {
					url: urlToGetDownloads,
					headers: {
						"referer": "http://www.subtitulos.es/"
					}
				};
				request(options, function(err, resp, body) {
					$ = cheerio.load(body);
					languageDomObjects = $(".language");
					for (i = 0; i < languageDomObjects.length; i++) {
						if (reLang.test(cheerio(languageDomObjects[i]).text().trim())) {
							arrayFilesToDownload.push(cheerio(languageDomObjects[i]).parent().find("a").attr("href"));
						}
					}
					async.series([
						function (callback) {
							zip = new admZip();
							for (i = 0; i < arrayFilesToDownload.length; i++) {
								options = {
									url: arrayFilesToDownload[i],
									headers: {
										"referer": "http://www.subtitulos.es/",
										"content-disposition": ""
									},
									encoding: "binary"
								};
								request(options, function(err, resp, body) {
									if (resp.headers['content-disposition'] !== null) {
										reResult = reFileName.exec(resp.headers['content-disposition']);
										if (reResult !== null) {
											fileName = cleanString(reResult[1]);
										} 
										else {
											fileName = "unknown";
										}
									} 
									else {
										fileName = "unknown";
									}
									console.log("Subtitle " + fileName + " downloaded!");
									downloadCounter++;
									zip.addFile(fileName, new Buffer(body));
									if (downloadCounter === arrayFilesToDownload.length) {
										callback(null);
									}
								});
							}
						},
						function (callback) {
							zipPath = path.join(res.locals.tmpFolder,req.params.id + "-" + seasons + ".zip");
							zip.writeZip(zipPath);
							console.log("Zip archive created in "+ zipPath);
							res.download(zipPath, function(err){
								fs.unlink(zipPath, function(err) {
									if(err) {
										console.log("Error deleting the zip file!");
										return;
									}
									console.log("Zip file deleted!");
								});
							});
							callback(null);
						}
					]);
				});
			}
		} 
		else {
			//Show error if no season found
			error = new Error("No seasons found");
			res.render('error', {
				message: error.message,
				error: error
			});
		}
	});
};

function cleanString(strAccents) {
	var strAccents = strAccents.split('');
	var strAccentsOut = new Array();
	var strAccentsLen = strAccents.length;
	var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽžñÑ';
	var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZznN";
	for (var y = 0; y < strAccentsLen; y++) {
		if (accents.indexOf(strAccents[y]) != -1) {
			strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
		} else
			strAccentsOut[y] = strAccents[y];
	}
	strAccentsOut = strAccentsOut.join('');
	return strAccentsOut;
}
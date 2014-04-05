var request = require('request'),
    cheerio = require('cheerio'),
    async = require('async');

exports.show = function(req, res){
	var urlToGetSeasons = "http://www.subtitulos.es/show/" + req.params.id,
		reSeason = /\,(\d{1,})\)/,
		//Spanish language harcoded for now
		reLang = /Español \(España\)/,
		arrayFilesToDownload = [],
		//TODO: REMOVE
		output_debug = "",
		downloadCounter = 0,
		reResult, $, seasons, error, options, urlToGetDownloads, languageDomObjects, i;
	//Get the seasons of the tvShow
	request(urlToGetSeasons, function(err, resp, body) {
		$ = cheerio.load(body);
		reResult = reSeason.exec($("body").attr("onload"));
		if (reResult != null) {
            seasons = reResult[1];
            if (seasons != null) {
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
					    	for (i = 0; i < arrayFilesToDownload.length; i++) {
								options = {
									url: arrayFilesToDownload[i],
									headers: {
										"referer": "http://www.subtitulos.es/"
									},
									encoding: "binary"
								};
								request(options, function(err, resp, body) {
									output_debug += body + "\n\n";
									output_debug += "#################################";
									output_debug += "\n\n";
									downloadCounter++;
									console.log("Subtitle downloaded!")
									if (downloadCounter === arrayFilesToDownload.length) {
										callback(null);
									}
								});
							}
					    },
					    function (callback) {
					    	console.log(output_debug);
							res.send(output_debug);
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

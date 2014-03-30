var request = require('request'),
	cheerio = require('cheerio');

exports.show = function(req, res){
	var urlToGetSeasons = "http://www.subtitulos.es/show/" + req.params.id,
		re = /\,(\d{1,})\)/,
		reResult, $, seasons, error, options, urlToGetDownloads;
	//Get the seasons of the tvShow
	request(urlToGetSeasons, function(err, resp, body) {
		$ = cheerio.load(body);
		reResult = re.exec($("body").attr("onload"));
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
					console.log(body);
				});
				res.send('respond with a resource');
            }
        }
        //Show error if no season found
        error = new Error("No seasons found");
        res.render('error', {
            message: error.message,
            error: error
        });
	});
};

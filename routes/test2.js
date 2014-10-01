var mongoose = require('mongoose'),
	tvShow = mongoose.model('TVShow'),
    info = require("../modules/tvShowInfo"),
	debug = require('debug')('node-express-subtitulos-es');

exports.test = function(req, response) {
	var tvshow = "";

    info.getTvShowList(function(tvShowsArray) {
        for (var i = tvShowsArray.length - 1; i >= 0; i--) {
            saveTvShowInDB(tvShowsArray[i].title, tvShowsArray[i].href);
        }
    });

    function saveTvShowInDB(title, href) {
        info.getTvShowPosterUrl(title, function(posterUrl) {
            tvshow = new tvShow({
                title:    title,
                href:     href,
                poster:   posterUrl
            });
            tvshow.save(function(err, tvshow) {
                if(err) debug("TVShow "+ tvshow.title + " not added to DB!! :'(");
                debug("TVShow "+ tvshow.title + " added to DB");
            });
        });
    }
};

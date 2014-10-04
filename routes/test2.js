var mongoose = require('mongoose'),
	tvShow = mongoose.model('TVShow'),
    info = require("../modules/tvShowInfo"),
	debug = require('debug')('node-express-subtitulos-es');

exports.test = function(req, response) {
	var tvshow = "",
        MAX_REQUESTS = 20;

    info.getTvShowList(function(tvShowsArray) {
        saveArraySliced(tvShowsArray, 0, MAX_REQUESTS, MAX_REQUESTS);
    });

    function saveArraySliced(tvShowsArray, lowerIndex, upperIndex, sliceSize) {
        debug("------------------> SAVING "+lowerIndex+" to "+upperIndex+ " of "+tvShowsArray.length);
        upperIndex = upperIndex >= tvShowsArray.length ? tvShowsArray.length : upperIndex;
        var tvShowArrayPart = tvShowsArray.slice(lowerIndex, upperIndex);
        saveTvShowsArrayInDB(tvShowArrayPart, function() {
            if (upperIndex === tvShowsArray.length) {
                debug("Finished array processing!");
                return;
            }
            lowerIndex += sliceSize;
            if (lowerIndex > tvShowsArray.length) {
                lowerIndex = tvShowsArray.length - lowerIndex;
            }
            upperIndex += sliceSize;
            saveArraySliced(tvShowsArray, lowerIndex, upperIndex, sliceSize);
        });
    }

    function saveTvShowInDB(tvShowObject, callback) {
        info.getTvShowPosterUrl(tvShowObject.title, function(posterUrl) {
            tvshow = new tvShow({
                title:    tvShowObject.title,
                href:     tvShowObject.href,
                poster:   posterUrl
            });
            tvshow.save(function(err, tvshow) {
                if(err) debug("TVShow "+ tvshow.title + " not added to DB!! :'(");
                debug("TVShow "+ tvshow.title + " added to DB");
                callback();
            });
        });
    }

    function saveTvShowsArrayInDB(tvShowsArray, callback) {
        var saved = 0
        var timerId = setInterval(function() {
            if (tvShowsArray.length === saved) {
                clearInterval(timerId);
                debug("Pack saved!");
                callback();
            }
        }, 500);        
        for (var i = tvShowsArray.length - 1; i >= 0; i--) {
            saveTvShowInDB(tvShowsArray[i],function() {
                saved++;
            });
        }
    }
};

var tvShowInfo = require("../modules/tvShowInfo");
exports.tvShows = function(req, res) {
	tvShowInfo.getTvShowList(req.params.ini, req.params.fin, function(tvShowsArray) {
		res.json(tvShowsArray);
	});
};

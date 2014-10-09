var express = require('express'),
	router = express.Router(),
	index = require('./routes/index'),
	languages = require('./routes/languages'),
	tvShows = require('./routes/tvShows'),
	download = require('./routes/download');

router.get("", index.index);
router.get("/api/tvShows/", tvShows.tvShows);
router.get("/api/tvShows/:ini/", tvShows.tvShows);
router.get("/api/tvShows/:ini/:fin/", tvShows.tvShows);
router.get("/api/languages", languages.languages);
router.get("/api/download/:id/:lang/:season", download.download);

module.exports = router;
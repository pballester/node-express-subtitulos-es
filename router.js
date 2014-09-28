var express = require('express'),
	router = express.Router(),
	index = require('./routes/index'),
	show = require('./routes/show');

router.get('/', index.index);
router.get('/show/:id/:lang', show.show);

module.exports = router;
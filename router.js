var express = require('express'),
	router = express.Router(),
	index = require('./routes/index'),
	show = require('./routes/show'),
	test = require('./routes/test2');

router.get('/', index.index);
router.get('/show/:id/:lang', show.show);
router.get('/test', test.test);

module.exports = router;
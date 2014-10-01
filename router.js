var express = require('express'),
	router = express.Router(),
	index = require('./routes/index'),
	show = require('./routes/show'),
	test = require('./routes/test'),
	test2 = require('./routes/test2');

router.get('/', index.index);
router.get('/show/:id/:lang', show.show);
router.get('/test', test.test);
router.get('/test2', test2.test);

module.exports = router;
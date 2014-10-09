exports.languages = function(req, res) {
	var objectLanguages = [{
		name: "Español (España)",
		value: "esp"
	}, {
		name: "Español (Latinoamérica)",
		value: "lat"
	}, {
		name: "English",
		value: "eng"
	}];

	res.json(objectLanguages);
};
$(function() {
	//Download service with the selected language in the params
	$(".tvShowName").click(function(e) {
		var anchorElement = $(e.currentTarget),
			currentHref = anchorElement.attr("href"),
			selectedLanguageValue = $(".selectLanguage").val();
		e.preventDefault();
		location.href = currentHref + "/" + selectedLanguageValue;
	});
	//Setting up the filter
	var options = {
		valueNames: ['tvShowName']
	}, tvShowList = new List('container', options);

});
exports.cleanString = function(strAccents) {
	var strAccents = strAccents.split(''),
		strAccentsOut = new Array(),
		strAccentsLen = strAccents.length,
		accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽžñÑ',
		accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZznN",
		y;
	for (y = 0; y < strAccentsLen; y++) {
		if (accents.indexOf(strAccents[y]) !== -1) {
			strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
		} else
			strAccentsOut[y] = strAccents[y];
	}
	strAccentsOut = strAccentsOut.join('');
	return strAccentsOut;
}
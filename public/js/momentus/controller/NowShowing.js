var NowShowing = function(nowShowingElement)
{
	var _self = this;

	_self.detailsFadeInDelay = 1;
	_self.detailsFadeInSpeed = 1;
	_self.detailsFadeOutSpeed = 1;
	_self.detailsFadeOutDelay = 1;

	var dateElement = nowShowingElement.find('.date');
	var detailsElement = nowShowingElement.find('.details');

	_self.clear = function()
	{
		dateElement.html('');
		detailsElement.html('');
	}

	var detailsFadeInTimer;
	_self.update = function(imageEntity)
	{
		clearTimeout(detailsFadeInTimer);

		var dateString = imageEntity.date.toLocaleDateString();

		if (dateElement.text() == dateString && detailsElement.text() == imageEntity.description) {
			return;
		}
		setTimeout(function() {
			nowShowingElement.fadeOut(detailsFadeOutSpeed * 1000, function() {
				clearTimeout(detailsFadeInTimer);

				dateElement.html(dateString);
				detailsElement.html(imageEntity.description);

				detailsFadeInTimer = setTimeout(function() {
					nowShowingElement.fadeIn(detailsFadeInSpeed * 1000);
				}, Math.max(_self.detailsFadeInDelay * 1000, 500));
			})
		}, _self.detailsFadeOutDelay * 1000);
	}
}
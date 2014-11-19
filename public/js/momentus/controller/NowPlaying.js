var NowPlaying = function(nowPlayingElement)
{
	var _self = this;

	var nowPlayingTimer;

	_self.clear = function()
	{
		nowPlayingElement.find('.track').html('');
		nowPlayingElement.find('.artists').html('');
	}

	_self.update = function(track)
	{
		console.log('Updating now playing', track);

		clearTimeout(nowPlayingTimer);

		var artistStrings = [];
		for (i in track.artists) {
			artistStrings.push(track.artists[i].name);
		}

		nowPlayingElement.fadeOut(500, function() {
			clearTimeout(nowPlayingTimer);

			nowPlayingElement.find('.track').html(track.name);
			nowPlayingElement.find('.artists').html(artistStrings.join(', '));

			nowPlayingTimer = setTimeout(function() {
				nowPlayingElement.fadeIn(500);
			}, 1000);
		});
	}
}
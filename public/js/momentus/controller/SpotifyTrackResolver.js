var SpotifyTrackResolver = function()
{
	var _self = this;
	_self.trackCache = {};

	this.getTrack = function(trackQuery, callback)
	{
		if (_self.trackCache[trackQuery]) {
			callback(_self.trackCache[trackQuery]);
			return;
		}

		console.log('Resolving track name', trackQuery);

		var xhr = $.ajax({
			'url': 'https://api.spotify.com/v1/search',
			'data': {
				'q': trackQuery,
				'type': 'track',
				'offset': 0,
				'limit': 1
			},
			'type': 'GET',
			'dataType': 'json',
		});

		xhr.done(function(response) {
			if (response.tracks.items.length) {
				track = response.tracks.items[0];
			} else {
				track = false;
			}
			_self.trackCache[trackQuery] = track;
			callback(_self.trackCache[trackQuery]);
		});
	}
}
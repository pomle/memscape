var AudioResolver = function()
{
	var _self = this;
	_self.audioUrls = {};

	this.getAudioUrl = function(trackQuery, callback)
	{
		if (_self.audioUrls[trackQuery]) {
			callback(_self.audioUrls[trackQuery]);
			return;
		}

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
			var trackUrl;
			if (response.tracks.items.length) {
				trackUrl = response.tracks.items[0].preview_url;
			} else {
				trackUrl = false;

			}
			_self.audioUrls[trackQuery] = trackUrl;
			callback(_self.audioUrls[trackQuery]);
		});
	}
}
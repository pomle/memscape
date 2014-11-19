var SpotifySongStream = function(access_token)
{
	var _self = this;
	var deferredXhrs = {};
	var activeCallback;
	var seenSongs = {};

	_self.source = 'Spotify';

	_self.tracks = {};
	_self.periodHitLength = 3;

	this.quantizeTime = function(date)
	{
		/* Clone date. */
		var date = new Date(date.getTime());
		var dayToSet = 0;
		var currentDay = date.getDay();
		var distance = dayToSet - currentDay;
		date.setDate(date.getDate() + distance);
		date.setUTCHours(12);
		date.setUTCMinutes(0);
		date.setUTCSeconds(0);
		date.setUTCMilliseconds(0);
		return date;
	}

	this.getSongsForTime = function(date, callback)
	{
		var startTime = _self.quantizeTime(date);
		startTime.setDate(startTime.getDate() - 7);
		var endTime = (new Date(startTime.getTime()));
		endTime.setDate(startTime.getDate() - 7);

		console.log('Getting tracks for', startTime);
		var toTime = startTime.getTime() / 1000;
		var fromTime = endTime.getTime() / 1000;
		var cacheKey = startTime.toString();

		if (_self.tracks[cacheKey]) {
			callback(_self.tracks[cacheKey]);
			return;
		}

		var payload = {};
		payload['from'] = fromTime;
		payload['to'] = toTime;

		if (!deferredXhrs[cacheKey]) {
			deferredXhrs[cacheKey] = $.ajax({
				'url': '/backend/playhistory.php',
				'data': payload,
				'type': 'GET',
				'dataType': 'json',
			});
		}

		deferredXhrs[cacheKey].done(function(response) {
			if (!response || !response.length) {
				console.log('Found no tracks');
				return;
			}
			console.log('Found tracks', response.length);
			var sanitizedTrackUris = [];
			var track;
			for (;;) {
				if (sanitizedTrackUris.length >= _self.periodHitLength) {
					break;
				}
				track = response.shift();
				if (!track) {
					break;
				}
				if (seenSongs[track.uri]) {
					console.log('Song already seen, skipping', track.uri);
					continue;
				}
				seenSongs[track.uri] = true;
				console.log('Adding track to seen songs', track.uri);
				/*if (!track.artist.name) {
					track.artist.name = 'No-name';
					//track.artist.name = track.artist['#text'];
				}*/
				sanitizedTrackUris.push(track.uri);
			}
			console.log('Sanitized tracks', sanitizedTrackUris.length);

			if (sanitizedTrackUris.length == 0) {
				_self.tracks[cacheKey] = [];
				callback(_self.tracks[cacheKey]);
				return;
			}

			console.log('Decorating tracks', sanitizedTrackUris);

			trackDecorator = $.ajax({
				'url': 'https://api.spotify.com/v1/tracks/',
				'data': {
					"ids": sanitizedTrackUris.join(',')
				},
				'type': 'GET',
				'dataType': 'json'
			});

			trackDecorator.done(function(response) {
				var i, track;
				var newTracks = [];
				for (i in response.tracks) {
					newTracks.push(response.tracks[i]);
				}
				_self.tracks[cacheKey] = newTracks;
				callback(_self.tracks[cacheKey]);
			});
		});
	}
}
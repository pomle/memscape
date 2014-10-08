var SongStream = function(LASTFM_TOKEN, lastFmUser)
{
	var _self = this;
	_self.tracks = {};

	var deferredXhrs = {};
	var activeCallback;
	var seenSongs = {};

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
		console.log('Last.fm web equivalent', 'http://www.last.fm/user/pomle/charts?charttype=weekly&subtype=track&range=' + (startTime.getTime() / 1000) + '-' + (endTime.getTime() / 1000));

		var cacheKey = startTime.toString();

		if (_self.tracks[cacheKey]) {
			callback(_self.tracks[cacheKey]);
			return;
		}

		if (!deferredXhrs[cacheKey]) {
			deferredXhrs[cacheKey] = $.ajax({
				'url': 'http://ws.audioscrobbler.com/2.0/?',
				'data': {
					'method': 'user.getweeklytrackchart',
					'user': lastFmUser,
					'from': startTime.getTime() / 1000,
					//'to': endTime.getTime() / 1000,
					'api_key': LASTFM_TOKEN,
					'format': 'json'
				},
				'type': 'GET',
				'dataType': 'json',
			});
		}

		deferredXhrs[cacheKey].done(function(response) {
			if (response.weeklytrackchart.track) {
				var sanitizedTracks = [];
				var track;
				for (i in response.weeklytrackchart.track) {
					track = response.weeklytrackchart.track[i];
					if (!seenSongs[track.mbid]) {
						seenSongs[track.mbid] = true;
						sanitizedTracks.push(track);
					}
				}
				_self.tracks[cacheKey] = sanitizedTracks;
				callback(_self.tracks[cacheKey]);
			}
		});
	}
}
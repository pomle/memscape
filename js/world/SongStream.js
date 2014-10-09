var SongStream = function(LASTFM_TOKEN, lastFmUser)
{
	var _self = this;
	var deferredXhrs = {};
	var activeCallback;
	var seenSongs = {};

	_self.tracks = {};
	_self.periodHitLength = 5;

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
		var lastFmTo = startTime.getTime() / 1000;
		var lastFmFrom = endTime.getTime() / 1000;
		console.log('Last.fm web equivalent', 'http://www.last.fm/user/' + lastFmUser + '/charts?charttype=weekly&subtype=track&range=' + lastFmFrom + '-' + lastFmTo);

		var cacheKey = startTime.toString();

		if (_self.tracks[cacheKey]) {
			callback(_self.tracks[cacheKey]);
			return;
		}

		var payload = {
			'user': lastFmUser,
			'api_key': LASTFM_TOKEN,
			'format': 'json'
		};
		var responseName;
		var maxDateDiff = 1000*60*60*24*15;
		if (new Date() - startTime < maxDateDiff) {
			console.log('Loading top tracks.')
			responseName = 'toptracks';
			payload['method'] = 'user.gettoptracks';
			payload['period'] = '7day';
		} else {
			console.log('Loading weekly chart.')
			responseName = 'weeklytrackchart';
			payload['method'] = 'user.getweeklytrackchart';
			payload['from'] = lastFmFrom;
			payload['to'] = lastFmTo;
			//payload['to'] = endTime.getTime() / 1000;
		}

		if (!deferredXhrs[cacheKey]) {
			deferredXhrs[cacheKey] = $.ajax({
				'url': 'http://ws.audioscrobbler.com/2.0/?',
				'data': payload,
				'type': 'GET',
				'dataType': 'json',
			});
		}

		deferredXhrs[cacheKey].done(function(response) {
			if (!response[responseName].track) {
				console.log('Found no tracks');
				return;
			}
			console.log('Found tracks', response[responseName].track.length);
			var sanitizedTracks = [];
			var track;
			for (;;) {
				if (sanitizedTracks.length >= _self.periodHitLength) {
					break;
				}
				track = response[responseName].track.shift();
				if (!track) {
					break;
				}
				if (seenSongs[track.url]) {
					continue;
				}
				seenSongs[track.url] = true;
				if (!track.artist.name) {
					track.artist.name = track.artist['#text'];
				}
				sanitizedTracks.push(track);
			}
			console.log('Sanitized tracks', sanitizedTracks.length);
			_self.tracks[cacheKey] = sanitizedTracks;
			callback(_self.tracks[cacheKey]);
		});
	}
}
var TrackQueue = function(fader, audioResolver)
{
	var _self = this;
	var maxPlayDuration = 28;
	var minExitDuration = fader.fadeOutDuration || 0;
	console.log('TrackQueue exit duration', minExitDuration);
	var queuedTracks = [];
	_self.currentTrack;

	_self.playNext = function()
	{
		if (queuedTracks.length == 0) {
			console.log('Queue empty');
			return false;
		}
		var nextTrack = queuedTracks.shift();
		if (_self.currentTrack == nextTrack) {
			console.log('Next track same as current, skipping forward.');
			queuedTracks.push(nextTrack);
			_self.playNext();
		}
		var trackQuery = nextTrack.artist.name + ' ' + nextTrack.name;
		audioResolver.getAudioUrl(trackQuery, function(track) {
			if (!track) {
				console.log('No audio candidate found for', trackQuery);
				return;
			}
			/* If an audio candidate was found, push back to end of queue. */
			queuedTracks.push(nextTrack);

			var audio = fader.fadeTo(track.preview_url);
			if (audio === false) {
				return false;
			}
			_self.currentTrack = nextTrack;
			var detectEndSong = function()
			{
				//console.log(this.duration - this.currentTime);
				if (this.currentTime >= maxPlayDuration || this.duration - this.currentTime < minExitDuration) {
					console.log('Track reached end, playing next in queue.');
					this.removeEventListener('timeupdate', detectEndSong);
					_self.playNext();
				}
			}
			audio.addEventListener('timeupdate', detectEndSong);
		});
	}

	_self.setQueue = function(queue)
	{
		queuedTracks = queue;
	}
}
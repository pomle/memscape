var TrackQueue = function(fader, audioResolver)
{
	var _self = this;
	var maxPlayDuration = 28;
	var minExitDuration = fader.fadeOutDuration || 0;
	var queuedTracks = [];
	_self.currentTrack;

	_self.playNext = function()
	{
		if (queuedTracks.length == 0) {
			console.log('Queue empty');
			return false;
		}
		var nextTrack = queuedTracks.shift();
		queuedTracks.push(nextTrack);
		if (_self.currentTrack == nextTrack) {
			console.log('Next track same as current, skipping forward.');
			_self.playNext();
		}
		audioResolver.getAudioUrl(nextTrack.artist['#text'] + ' ' + nextTrack.name, function(audioUrl) {
			var audio = fader.fadeTo(audioUrl);
			if (audio === false) {
				return false;
			}
			_self.currentTrack = nextTrack;
			var detectEndSong = function()
			{
				//console.log(this.currentTime);
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
var TrackQueue = function(fader)
{
	var _self = this;
	_self.__proto__ = new Observable();

	_self.fader = fader;

	_self.currentTrack;
	_self.maxPlayDuration = 10;
	_self.minExitDuration = fader.fadeOutDuration || 0;

	console.log('TrackQueue exit duration', _self.minExitDuration);

	var queuedTracks = [];

	var detectEndSong = function()
	{
		//console.log(this.duration - this.currentTime);
		if (this.currentTime >= _self.maxPlayDuration || this.duration - this.currentTime < _self.minExitDuration) {
			console.log('Track reached end, playing next in queue.');
			this.removeEventListener('timeupdate', detectEndSong);
			_self.playNext();
		}
	};

	_self.playNext = function()
	{
		if (queuedTracks.length == 0) {
			console.log('Queue empty');
			return false;
		}
		var track = queuedTracks.shift();
		console.log('Playing track', track);
		queuedTracks.push(track);
		var result = fader.fadeTo(track.preview_url, function(audio) {
			audio.addEventListener('timeupdate', detectEndSong);
		});
		if (true === result ) {
			_self.trigger('trackChange', track);
			return true;
		}
	}

	_self.setQueue = function(trackEntities)
	{
		queuedTracks = trackEntities;
	}
}
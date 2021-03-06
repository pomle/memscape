var AudioFader = function(intermediate_audio_url)
{
	var _self = this;
	var readyToFade = false;
	var current;
	var minDelay = 1000;

	_self.fadeOutDuration = 2;
	_self.channels = {
		'intermediate': document.createElement('video'),
		'current': null
	}

	_self.channels.intermediate.loop = true;
	var intermediateReady = function() {
		readyToFade = true;
		this.removeEventListener('canplay', intermediateReady);
		console.log('AudioFader is ready to fade');
	};
	_self.channels.intermediate.addEventListener('canplay', intermediateReady);
	_self.channels.intermediate.src = intermediate_audio_url;

	var retryTimeout;
	_self.fadeTo = function(mixin_audio_url, callback)
	{
		if (!mixin_audio_url) {
			console.log('Invalid audio url', mixin_audio_url);
			return false;
		}

		if (!readyToFade) {
			console.log('Not ready to fade');
			return false;
		}
		readyToFade = false;
		var isMixinReady = false;
		var currentChannel = _self.channels.current;

		/* Assume failure and go back to ready state after some time. */
		clearTimeout(retryTimeout);
		retryTimeout = setTimeout(function() {
			console.log('AudioFader force ready');
			readyToFade = true;
		}, minDelay + 4000);

		var doMix = function()
		{
			console.log('Mixin ready?', isMixinReady);
			if (isMixinReady) {
				mixin.play();
				_self.channels.current = mixin;
				TweenLite.to(mixin, 1, {
					'volume': 1,
					'onComplete': function() {
						clearTimeout(retryTimeout);
						readyToFade = true;
					}
				});
				TweenLite.to(_self.channels.intermediate, 1, {
					'volume': 0,
					'onComplete': function() {
						_self.channels.intermediate.pause();
					}
				});
				if (callback) {
					callback(mixin);
				}
			}
			isMixinReady = true;
		}

		var mixin_timeout = setTimeout(doMix, minDelay);
		var mixin = document.createElement('video');
		mixin.oncanplay = function() { doMix(); };
		mixin.volume = 0;
		mixin.src = mixin_audio_url;
		_self.channels.intermediate.volume = 0;
		_self.channels.intermediate.play();

		TweenLite.to(_self.channels.intermediate, 1, {
			'volume': .9,
		});

		if (currentChannel) {
			console.log('Fading out current track');
			TweenLite.to(currentChannel, _self.fadeOutDuration, {
				'volume': 0,
				'onComplete': function() {
					console.log('Pausing channel', currentChannel);
					currentChannel.pause();
				}
			});
		}

		return true;
	}

	_self.pause = function()
	{
		_self.channels.current.pause();
	}

	_self.play = function()
	{
		_self.channels.current.play();
	}
}
var HUD = function(hudElement)
{
	var _self = this;

	_self.nowPlaying = new NowPlaying(hudElement.find('.nowPlaying'));
	_self.nowShowing = new NowShowing(hudElement.find('.nowShowing'));
}
var Photographer = function(camera, timeline)
{
	var _self = this;
	_self.camera = camera;
	_self.timeline = timeline;
	_self.duration = .8;
	_self.easing = Power1.easeOut;

	var tween = new TweenMax(camera.position, _self.duration, {
		'ease': _self.easing
	});

	_self.goto = function(x, y, z)
	{
		console.log('New camera focus point', x,y,z);
		/*tween.updateTo({
			'x': x,
			'y': y,
			'z': z,
			'onComplete': function() { console.log('Camera movement complete', camera.position); }
		}, true);*/
		TweenMax.to(timeline.position, _self.duration, {
			'x': x,
			'y': y,
			'z': z-100,
			'ease': Power2.easeInOut,
		});

		TweenMax.to(camera.position, _self.duration, {
			'x': x,
			'y': y,
			'z': z,
			'ease': _self.easing
		});
	}

	_self.nudge = function(x, y, z)
	{
		_self.goto(
			camera.position.x + x,
			camera.position.y + y,
			camera.position.z + z
		);
	}
}
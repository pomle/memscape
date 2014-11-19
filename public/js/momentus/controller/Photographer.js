var Photographer = function(camera)
{
	var _self = this;
	_self.camera = camera;
	_self.duration = .8;
	_self.easing = Power1.easeOut;

	var tween = new TweenMax(camera.position, _self.duration, {
		'ease': _self.easing
	});

	_self.goto = function(x, y, z)
	{
		console.log('New camera focus point', x,y,z);

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
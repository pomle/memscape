var Photographer = function(camera)
{
	var _self = this;
	var duration = .8;
	var tween = new TweenMax(camera.position, duration, {
		'ease': Power1.easeOut
	});

	this.goto = function(x, y, z)
	{
		console.log("Current camera focus point", camera.position.x, camera.position.y, camera.position.z)
		console.log('New camera focus point', x,y,z);
		/*tween.updateTo({
			'x': x,
			'y': y,
			'z': z,
			'onComplete': function() { console.log('Camera movement complete', camera.position); }
		}, true);*/
		TweenMax.to(camera.position, duration, {
			'x': x,
			'y': y,
			'z': z
		});
	}

	this.nudge = function(x, y, z)
	{
		_self.goto(camera.position.x + x, camera.position.y + y, camera.position.z + z);
	}
}
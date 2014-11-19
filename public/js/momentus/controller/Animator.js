var Animator = function(renderer, scene, camera)
{
	var _self = this;

	var isRunning = false;
	var timeStart;

	_self.scene = scene;
	_self.camera = camera;

	var animate = function()
	{
		if (!isRunning) {
			return;
		}
		renderer.render(_self.scene, _self.camera);
		requestAnimationFrame(animate);
	}

	var diff = function()
	{
		return time() - timeStart;
	}

	var time = function()
	{
		return (new Date()).getTime();
	}
	timeStart = time();

	_self.start = function()
	{
		isRunning = true;
		animate();
	}

	_self.stop = function()
	{
		isRunning = false;
	}
}
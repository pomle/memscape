var ImageModel = function(image_url)
{
	var _self = this;
	_self.angularSpeed = .2;

	var fadeIn = function() {
		var duration = .8;
		var easing = Power3.easeInOut;
		TweenLite.fromTo(
			_self.material,
			duration,
			{
				'opacity': 0,
			},
			{
				'opacity': 1,
				'ease': easing
			}
		);

		TweenLite.fromTo(
			_self.model.position,
			duration,
			{
				'z': _self.model.position.z - 100
			},
			{
				'z': _self.model.position.z,
				'ease': easing
			}
		);
	}

	_self.material = new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture(image_url, null, fadeIn),
		side: THREE.DoubleSide,
		opacity: 0,
		transparent: true
	});

	_self.model = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), _self.material);
	_self.model.overdraw = true;

	var animate = function() {
		var angleChange = _self.angularSpeed * timeDiff * 2 * Math.PI / 1000;
		_self.model.rotation.y += angleChange;
		requestAnimationFrame(animate);
	};
	//animate();
}
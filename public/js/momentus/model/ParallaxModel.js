var ImageModel = function(image_url)
{
	var _self = this;
	_self.angularSpeed = .2;

	var fadeIn = function() {
		TweenLite.to(material, .8, {
			'opacity': 1,
			'ease': Power3.easeInOut
		});
	}

	var material = new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture(image_url, null, fadeIn),
		side: THREE.DoubleSide,
		opacity: 0,
		transparent: true
	});

	_self.model = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), material);
	_self.model.overdraw = true;

	var animate = function() {
		var angleChange = _self.angularSpeed * timeDiff * 2 * Math.PI / 1000;
		_self.model.rotation.y += angleChange;
		requestAnimationFrame(animate);
	};
	//animate();
}
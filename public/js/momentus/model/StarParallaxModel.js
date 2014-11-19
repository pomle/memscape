var StarParallaxModel = function(position, scene)
{
	var _self = this;
	var layers = [];

	_self.addLayer = function(image_url)
	{
		var fadeIn = function() {
			TweenLite.to(material, .8, {
				'opacity': 1,
				'ease': Power3.easeInOut
			});
		}
		var texture = THREE.ImageUtils.loadTexture(image_url, null);
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(4, 4);

		var material = new THREE.MeshLambertMaterial({
			map: texture,
			side: THREE.FrontSide,
			opacity: 1,
			transparent: true
		});

		var model = new THREE.Mesh(new THREE.PlaneGeometry(20000, 20000), material);
		model.overdraw = true;
		model.position.x = position.x;
		model.position.y = position.y;
		model.position.z = position.z + (-1000 * layers.length);

		layers.push(model);
		scene.add(model);
	}

	var animate = function() {
		var angleChange = _self.angularSpeed * timeDiff * 2 * Math.PI / 1000;
		_self.model.rotation.y += angleChange;
		requestAnimationFrame(animate);
	};
}
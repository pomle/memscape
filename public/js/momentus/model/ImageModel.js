var ImageModel = function(instagram_item)
{
	var _self = this;

	var resolveUrl = function(instagram_cdn_url)
	{
		return '/instagram_image/' + instagram_cdn_url.split('//')[1];
	}

	var fadeIn = function() {
		var duration = .5 + (3*Math.random());;
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

	if (instagram_item['videos']) {
		try {
			var video_url = resolveUrl(instagram_item['videos']['low_resolution']['url']);
			var video = document.createElement('video');
			video.loop = true;
			video.volume = 0;
			video.src = video_url;
			video.play();
			var texture	= new THREE.Texture(video);
			texture.minFilter = THREE.NearestFilter;
			texture.magFilter = THREE.NearestFilter;
			_self.material = new THREE.MeshBasicMaterial({
				map: texture,
				side: THREE.FrontSide,
				opacity: 0,
				transparent: true
			});
			var videoIsReady = false;
		} catch (error) {
			_self.material = new THREE.MeshBasicMaterial({
				wireframe: true,
				color: 'white'
			});
		}
	} else {
		var image_url = resolveUrl(instagram_item['images']['standard_resolution']['url']);
		_self.material = new THREE.MeshLambertMaterial({
			map: THREE.ImageUtils.loadTexture(image_url, null, fadeIn),
			side: THREE.FrontSide,
			opacity: 0,
			transparent: true
		});
	}

	_self.model = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), _self.material);
	_self.model.overdraw = true;

	var animate = function() {
		//var angleChange = _self.angularSpeed * timeDiff * 2 * Math.PI / 1000;
		//_self.model.rotation.y += angleChange;
		if (video && texture) {
			if (video.readyState === video.HAVE_ENOUGH_DATA) {
				if (!videoIsReady) {
					videoIsReady = true;
					fadeIn();
				}
				texture.needsUpdate = true;
			}
		}
		requestAnimationFrame(animate);
	};
	animate();
}
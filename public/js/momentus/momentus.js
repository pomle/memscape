var Momentus = function(songStream, imageStream, hud)
{
	var _self = this;
	_self.__proto__ = new Observable();


	var viewMode;

	THREE.ImageUtils.crossOrigin = '*';

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.domElement.className = renderer.domElement.className + 'viewport';
	document.body.appendChild(renderer.domElement);

	var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 3000;
	_self.camera = camera;

	var scene = new THREE.Scene();
	_self.scene = scene;

	var animator = new Animator(renderer, scene, camera);

	var ambientLight = new THREE.AmbientLight(0xffffff);
	scene.add(ambientLight);

	var photographer = new Photographer(camera);
	_self.photographer = photographer;


	var imageTimeline = new CollageModel(new THREE.Vector3(0,0,-200), scene);
	var imageIndex = -1;
	var audioMixer = new AudioFader('audio/static.mp3');
	var trackQueue = new TrackQueue(audioMixer);

	_self.songStream = songStream;
	_self.imageStream = imageStream;
	_self.trackQueue = trackQueue;

	trackQueue.bind('trackChange', function(track) {
		hud.nowPlaying.update(track);
	});


	function addImages()
	{
		_self.imageStream.loadImages(function() {
			var image;
			while (image = _self.imageStream.next()) {
				console.log('Adding image to wall', image);
				imageTimeline.addImage(image);
			}

			if (imageIndex < 0) {
				_self.skipTo(0);
			}
		});
	}

	_self.focusOnActiveImage = function()
	{
		if (!imageTimeline.images[imageIndex]) {
			console.log('Image index does not exist', imageIndex);
			return;
		}
		var image = imageTimeline.images[imageIndex];
		var pos = image.ImageModel.model.position;
		console.log('Focusing on', imageIndex, image, pos);

		hud.nowShowing.update(image);

		switch (viewMode) {
			case 3:
				photographer.goto(pos.x, 0, 1200);
			break;
			case 2:
				photographer.goto(pos.x, 0, 400);
			break;
			default:
				photographer.goto(pos.x - 60, pos.y, pos.z + 300);
			break;
		}

		updateNowPlaying(image);
	}

	var currentPeriod;
	var nowPlaying;
	function updateNowPlaying(imageEntity)
	{
		var timePeriod = _self.songStream.quantizeTime(imageEntity.date);
		if (currentPeriod && timePeriod.toString() == currentPeriod.toString()) {
			console.log('Identical timeperiod, not fetching new tracks.');
			return;
		}
		currentPeriod = timePeriod;
		_self.songStream.getSongsForTime(imageEntity.date, function(queue) {
			console.log('Got track queue', queue);
			if (!queue.length) {
				return;
			}
			trackQueue.setQueue(queue);
			trackQueue.playNext();
		});
	}

	var viewModes = [1,2,3];
	var viewModeIndex = 0;
	_self.cycleViewMode = function()
	{
		viewModeIndex = ++viewModeIndex % viewModes.length;
		_self.setViewMode(viewModes[viewModeIndex]);
	}

	_self.setViewMode = function(type)
	{
		if (viewMode != type) {
			photographer.duration = _self.navigateCameraDuration;
			switch (type) {
				case 1:
					TweenLite.to(photographer.camera.rotation, _self.navigateCameraDuration, {'y': -.15});
				break;
				default:
					TweenLite.to(photographer.camera.rotation, _self.navigateCameraDuration, {'y': 0});
				break;
			}
			viewMode = type;
			_self.focusOnActiveImage();
		}
	}
	_self.setViewMode(viewModes[viewModeIndex]);

	_self.autoAdvanceIdleTimeout = 8;
	_self.autoAdvanceImageExposure = 5;
	_self.autoAdvanceCameraDuration = 5;
	_self.navigateCameraDuration = .8;

	var Navigate = {
		down: function() {
			photographer.nudge(0, 0, 200);
		},
		up: function() {
			photographer.nudge(0, 0, -200);
		},
		left: function() {
			_self.skipStep(-1);
		},
		right: function() {
			_self.skipStep(1);
		}
	}

	var skipKeyMap = {
		37: Navigate.left,
		39: Navigate.right,
		38:	Navigate.up,
		40: Navigate.down
	};

	var CAMERA_SPEED_AUTO = 'autoAdvance';
	var CAMERA_SPEED_USER = 'userSkip';

	var cameraSpeeds = {
		CAMERA_SPEED_AUTO: {
			'detailsFadeInDelay': 0,
			'detailsFadeOutDelay': .8,
			'detailsFadeInSpeed': 1.5,
			'detailsFadeOutSpeed': .5
		},
		CAMERA_SPEED_USER: {
			'detailsFadeInDelay': 0,
			'detailsFadeOutDelay': 0,
			'detailsFadeInSpeed': .3,
			'detailsFadeOutSpeed': .1
		}
	};

	_self.setCameraSpeed = function(cameraSpeed)
	{
		detailsFadeInDelay = 0;
		detailsFadeOutDelay = .8;
		detailsFadeInSpeed = 1.5;
		detailsFadeOutSpeed = .5;
	}

	_self.advanceTo = function(index)
	{
		_self.setCameraSpeed(CAMERA_SPEED_AUTO);
		photographer.duration = _self.autoAdvanceCameraDuration;
		photographer.easing = Power2.easeInOut;
		_self.skipStep(1);
	}

	var autoAdvanceTimer;
	var autoAdvance = function()
	{
		_self.advanceTo(1);
		autoAdvanceTimer = setTimeout(autoAdvance, _self.autoAdvanceImageExposure*1000);
	}

	_self.getImageIndex = function()
	{
		return imageIndex;
	}


	_self.shutDown = function(callback)
	{
		$(window).unbind('.momentus');

		photographer.duration = 5;
		photographer.goto(0, 0, 10000);

		for (i in imageTimeline.images) {
			TweenLite.to(imageTimeline.images[i].ImageModel.material, 2*Math.random(), {
				'opacity': 0,
				'ease': Power4.easeInOut,
				'delay': 2.5 * Math.random(),
				'onComplete': function() {
					scene.remove(imageTimeline.images[i].ImageModel.model);
				}
			});
		}

		TweenLite.to([audioMixer.channels.intermediate, audioMixer.channels.current], 5, {
			'volume': 0,
			'onComplete': function() {
				audioMixer.channels.intermediate.pause();
				audioMixer.channels.current.pause();
			}
		});

		clearTimeout(autoAdvanceTimer);
		setTimeout(function() {
			hud.nowPlaying.clear();
			hud.nowShowing.clear();
			callback();
		}, 5000);
	}


	_self.skipStep = function(steps)
	{
		return _self.skipTo(imageIndex + steps);
	}

	_self.skipTo = function(index)
	{
		if (index == imageIndex) {
			return;
		}

		if (index < 0) {
			index = 0;
		} else {
			var maxIndex = imageTimeline.images.length - 1;
			if (index > maxIndex) {
				index = maxIndex;
			}
		}

		imageIndex = index;

		if (index > maxIndex - 10) {
			addImages();
		}

		return _self.focusOnActiveImage();
	}

	$(window)
		.on('keydown.momentus', function(e) {
			if (skipKeyMap[e.which]) {
				clearTimeout(autoAdvanceTimer);
				_self.setCameraSpeed(CAMERA_SPEED_USER);
				autoAdvanceTimer = setTimeout(autoAdvance, _self.autoAdvanceIdleTimeout*1000);
				photographer.duration = _self.navigateCameraDuration;
				photographer.easing = Power1.easeOut;
				skipKeyMap[e.which]();
				return;
			}

			switch (e.which) {
				case 67: // c
					_self.cycleViewMode();
					return;
				break;
				case 70: // f
					trackQueue.playNext();
					return;
				break;
			}
			console.log('Unassigned key', e.which);
		})
		.on('resize.momentus', function() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		});

	addImages();
	autoAdvance();

	animator.start();
}
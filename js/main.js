var AutonomousMoments = function(lastFmUser, instagramUser)
{
	var _self = this;
	_self.INSTAGRAM_TOKEN = '9e0d8a7b13ee43b289b72b8a67db7f25';
	_self.LASTFM_TOKEN = '8d4baa503415f095169f6d44f3bd677c';


	var time = 0;
	var lastTime = 0;
	var timeDiff = 0;

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

	var ambientLight = new THREE.AmbientLight(0xffffff);
	scene.add(ambientLight);

	var timeline = new TimelineModel(scene);

	var photographer = new Photographer(camera, timeline.model);


	function animate() {
		time = (new Date()).getTime();
		timeDiff = time - lastTime;
		lastTime = time;
		renderer.render(scene, camera);
		requestAnimationFrame(animate);
	}
	animate();

	var imageTimeline = new ImageStream(new THREE.Vector3(0,0,-200), scene);
	_self.imageTimeline = imageTimeline;
	var imageIndex = -1;
	var audioMixer = new AudioFader('audio/static.mp3');
	var songs = new SongStream(_self.LASTFM_TOKEN, lastFmUser);
	var audioResolver = new AudioResolver();
	var trackQueue = new TrackQueue(audioMixer, audioResolver);

	function addImages()
	{
		InstaStream.populateMore(function() {
			while (InstaStream.next()) {
				imageTimeline.addImage(InstaStream.getImage());
				if (imageIndex < 0) {
					imageIndex = 0;
					focusOnActiveImage();
				}
			}
		});
	}


	var InstaStream = new InstagramUserImagePool(_self.INSTAGRAM_TOKEN, instagramUser);
	InstaStream.onReady = addImages;

	var hudElement = $('.hud');
	var informationElement = hudElement.find('.informationPanel');
	var dateElement = informationElement.find('.date');
	var detailsElement = informationElement.find('.details');
	var detailsFadeInTimer;
	var detailsFadeInDelay = 1;
	var detailsFadeInSpeed = 1;

	function focusOnActiveImage()
	{
		if (!imageTimeline.images[imageIndex]) {
			console.log('Image index does not exist', imageIndex);
			return;
		}
		var imageEntity = imageTimeline.images[imageIndex];
		var pos = imageEntity.ImageModel.model.position;
		console.log('Focusing on', imageIndex, imageEntity, pos);

		timeline.addDate(imageEntity.date);

		var dateString = imageEntity.date.toLocaleDateString();
		var detailsString = imageEntity.metadata.filter;

		if (dateElement.text() != dateString || detailsElement.text() != detailsString) {
			clearTimeout(detailsFadeInTimer);
			informationElement.fadeOut(300, function() {
				dateElement.html(dateString);
				detailsElement.html(detailsString);
				detailsFadeInTimer = setTimeout(function() { informationElement.fadeIn(detailsFadeInSpeed*1000); }, detailsFadeInDelay*1000);
			});
		}

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

		updateNowPlaying(imageEntity);
	}



	var currentPeriod;
	var nowPlaying;
	function updateNowPlaying(imageEntity)
	{
		var timePeriod = songs.quantizeTime(imageEntity.date);
		if (currentPeriod && timePeriod.toString() == currentPeriod.toString()) {
			console.log('Identical timeperiod, not fetching new tracks.');
			return;
		}
		currentPeriod = timePeriod;
		songs.getSongsForTime(imageEntity.date, function(data) {
			if (!data.length) {
				return;
			}
			trackQueue.setQueue(data);
			trackQueue.playNext();
		});
	}

	_self.setViewMode = function(type)
	{
		if (viewMode != type) {
			switch (type) {
				case 1:
					TweenLite.to(photographer.camera.rotation, photographer.duration, {'y': -.14});
				break;
				default:
					TweenLite.to(photographer.camera.rotation, photographer.duration, {'y': 0});
				break;
			}
		}
		viewMode = type;
		focusOnActiveImage();
	}
	_self.setViewMode(1);

	addImages();

	_self.autoAdvanceIdleTimeout = 8;
	_self.autoAdvanceImageExposure = 5;
	_self.autoAdvanceCameraDuration = 5;
	_self.navigateCameraDuration = .8;

	var skipImage = function(steps)
	{
		var maxIndex = imageTimeline.images.length - 1;
		imageIndex += steps;
		if (imageIndex < 0) {
			imageIndex = 0;
		} else if (imageIndex > maxIndex) {
			imageIndex = maxIndex;
		}
		if (imageIndex > maxIndex - 10) {
			addImages();
		}
		focusOnActiveImage();
	}

	var Navigate = {
		down: function() {
			photographer.nudge(0, 0, 200);
		},
		up: function() {
			photographer.nudge(0, 0, -200);
		},
		left: function() {
			skipImage(-1);
		},
		right: function() {
			skipImage(1);
		}
	}

	var skipKeyMap = {
		37: Navigate.left,
		39: Navigate.right,
		38:	Navigate.up,
		40: Navigate.down
	};

	var autoAdvanceTimer;
	var autoAdvance = function()
	{
		detailsFadeInDelay = 1;
		detailsFadeInSpeed = 2;
		photographer.duration = _self.autoAdvanceCameraDuration;
		photographer.easing = Power2.easeInOut;
		skipImage(1);
		autoAdvanceTimer = setTimeout(autoAdvance, _self.autoAdvanceImageExposure*1000);
	}
	autoAdvance();

	_self.shutDown = function(callback)
	{
		$(window).unbind('.momentus');

		photographer.duration = 5;
		photographer.goto(0, 0, 10000);
		hudElement.fadeOut();

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
		setTimeout(callback, 5000);
	}

	$(window)
		.on('keydown.momentus', function(e) {
			if (skipKeyMap[e.which]) {
				clearTimeout(autoAdvanceTimer);
				autoAdvanceTimer = setTimeout(autoAdvance, _self.autoAdvanceIdleTimeout*1000);
				detailsFadeInDelay = 0;
				detailsFadeInSpeed = .8;
				photographer.duration = _self.navigateCameraDuration;
				photographer.easing = Power1.easeOut;
				skipKeyMap[e.which]();
			} else {
				console.log(e.which);
				switch (e.which) {
					case 70:
						trackQueue.playNext();
					break;
				}
			}
		}).on('resize.momentus', function() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		});
}
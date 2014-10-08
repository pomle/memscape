var AutonomousMoments = function(lastFmUser, instagramUser)
{
	var _self = this;
	_self.INSTAGRAM_TOKEN = '9e0d8a7b13ee43b289b72b8a67db7f25';
	_self.LASTFM_TOKEN = '8d4baa503415f095169f6d44f3bd677c';


	var time = 0;
	var lastTime = 0;
	var timeDiff = 0;

	var imageFollowTrait = 1;
	var setImageFollowTrait;

	THREE.ImageUtils.crossOrigin = '*';

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
	camera.rotation.x = 0;
	camera.position.y = 0;
	camera.position.z = 400;

	var photographer = new Photographer(camera);

	var scene = new THREE.Scene();

	var ambientLight = new THREE.AmbientLight(0xffffff);
	scene.add(ambientLight);

	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(1, 1, 1);//.normalize();
	//scene.add(directionalLight);

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

	function focusOnActiveImage()
	{
		var imageEntity = imageTimeline.images[imageIndex];
		var pos = imageEntity.ImageModel.model.position;
		console.log('Focusing on', imageIndex, imageEntity, pos);

		switch (imageFollowTrait) {
			case 2:
				photographer.goto(pos.x, 0, 400);
			break;
			default:
				photographer.goto(pos.x, pos.y, pos.z + 300);
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

	_self.setImageFollowTrait = function(type)
	{
		imageFollowTrait = type;
		focusOnActiveImage();
	}

	addImages();

	var stepMultiplier = 1;

	var Navigate = {
		down: function() {
			photographer.nudge(0, 0, -stepMultiplier * 100);
		},
		up: function() {
			photographer.nudge(0, 0, stepMultiplier * 100);
		},
		left: function() {
			imageIndex -= stepMultiplier;
			if (imageIndex < 0) {
				imageIndex = 0;
			}
			focusOnActiveImage();
			//photographer.nudge(-200, 0, 0);
		},
		right: function() {
			console.log(stepMultiplier);
			imageIndex += stepMultiplier;
			var maxIndex = imageTimeline.images.length - 1;
			if (imageIndex > maxIndex) {
				imageIndex = maxIndex;
			}
			focusOnActiveImage();
			if (imageIndex > imageTimeline.images.length - 10) {
				addImages();
			}
			//photographer.nudge(200, 0, 0);
		}
	}

	$(window).on('keydown', function(e) {
		switch (e.which) {
			case 38:
				Navigate.down();
			break;
			case 40:
				Navigate.up();
			break;
			case 37:
				Navigate.left();
			break;
			case 39:
				Navigate.right();
			break;
		}
	});
}
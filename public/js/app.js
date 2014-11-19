var momentus;
var momentusReady = true;

$(function() {
	var hudElement = $('.hud');
	var login = $('.login');

	hudElement.find('.controlPanel')
		.on('click', '.camera', function(e) {
			e.preventDefault();
			momentus.cycleViewMode();
		})
		.on('click', '.shutdown', function(e) {
			e.preventDefault();
			if (momentus.shutDown) {
				hudElement.fadeOut();
				momentus.shutDown(function() {
					$('.viewport').remove();
					login.fadeIn();
					momentus = null;
					momentusReady = true;
				});
			}
		});

	login.find('form.start').on('submit', function(e) {
		e.preventDefault();
		if (!momentusReady) {
			return;
		}
		momentusReady = false;

		var spotify_access_token = this.elements['spotify_access_token'].value;
		var instagram_access_token = this.elements['instagram_access_token'].value;

		login.fadeOut(500, function() {
			$('.hud').fadeIn();
			var spotifySongStream = new SpotifySongStream(spotify_access_token);
			var lastFmSongStream = new LastFmSongStream('pomle');
			var imageStream = new InstagramStream(instagram_access_token);
			var hud = new HUD(hudElement);

			//momentus = new Momentus(spotifySongStream, imageStream, hud);
			momentus = new Momentus(lastFmSongStream, imageStream, hud);
		});
	});
});
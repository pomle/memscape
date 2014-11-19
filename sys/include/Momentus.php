<?php
$envs = $Env->getVariables();

header("Content-Type: text/html");

$token_spotify = null;
$token_instagram = null;

if (isset($User->services['instagram'])) {
	$token_instagram = $User->services['instagram']->access_token;
}

if (isset($User->services['spotify'])) {
	$token_spotify = $User->services['spotify']->access_token;
}

?><html>
	<head>
		<title>momentus</title>
		<meta name="viewport" content="width=640, user-scalable=no">
		<link href="assets/main.css" type="text/css" rel="stylesheet">
		<script src="js/lib/jquery.min.js"></script>
		<script src="js/lib/three.min.js"></script>
		<script src="js/lib/TweenMax.min.js"></script>
		<script src="js/lib/Observable.js"></script>
		<script src="js/app.js"></script>
		<script src="js/momentus/momentus.js"></script>
		<script src="js/momentus/controller/SpotifyTrackResolver.js"></script>
		<script src="js/momentus/controller/SpotifySongStream.js"></script>
		<script src="js/momentus/controller/LastFmSongStream.js"></script>
		<script src="js/momentus/controller/InstagramStream.js"></script>
		<script src="js/momentus/controller/AudioFader.js"></script>
		<script src="js/momentus/controller/Animator.js"></script>
		<script src="js/momentus/controller/HUD.js"></script>
		<script src="js/momentus/controller/NowPlaying.js"></script>
		<script src="js/momentus/controller/NowShowing.js"></script>
		<script src="js/momentus/controller/Photographer.js"></script>
		<script src="js/momentus/controller/TrackQueue.js"></script>
		<script src="js/momentus/entity/ImageEntity.js"></script>
		<script src="js/momentus/entity/TrackEntity.js"></script>
		<script src="js/momentus/model/ImageModel.js"></script>
		<script src="js/momentus/model/CollageModel.js"></script>
	</head>
	<body>
		<div class="hud">
			<div class="controlPanel">
				<a href="#" class="button camera"></a>
				<a href="#" class="button shutdown"></a>
			</div>
			<div class="informationPanel nowPlaying">
				<h3 class="track"></h3>
				<h4 class="artists"></h4>
			</div>
			<div class="informationPanel nowShowing">
				<h1 class="date"></h1>
				<h3 class="details"></h3>
			</div>
		</div>
		<div class="content">
			<div class="login">
				<h1>momentus</h1>
				<p class="instructions">
					Navigate with arrow keys.<br>
					Change camera with C.<br>
					Skip song with F.
				</p>

				<?php
				if ($token_spotify && $token_instagram) {
					?>
					<form action="#" method="GET" class="start">
						<div class="start">
							<input type="hidden" name="spotify_access_token" value="<?php echo htmlspecialchars($token_spotify); ?>">
							<input type="hidden" name="instagram_access_token" value="<?php echo htmlspecialchars($token_instagram); ?>">
							<button type="submit">Start</button>
						</div>
					</form>
					<?php
				}
				else {
					?>
					<table>
						<tr>
							<td>
								<form action="https://accounts.spotify.com/authorize/" method="GET">
									<div class="provider spotify">
										<input type="hidden" name="client_id" value="<?php echo $envs['spotify_client_id']; ?>">
										<input type="hidden" name="redirect_uri" value="<?php echo BASE_URI, $envs['spotify_redirect_uri']; ?>">
										<input type="hidden" name="response_type" value="code">
										<input type="hidden" name="scope" value="user-library-read user-read-private">
										<button type="submit"><?php
											echo $token_spotify ? 'OK' : 'Connect';
										?></button>
									</div>
								</form>
							</td>
							<td>
								<form action="https://api.instagram.com/oauth/authorize/" method="GET">
									<div class="provider instagram">
										<input type="hidden" name="client_id" value="<?php echo $envs['instagram_client_id']; ?>">
										<input type="hidden" name="redirect_uri" value="<?php echo BASE_URI, $envs['instagram_redirect_uri']; ?>">
										<input type="hidden" name="response_type" value="code">
										<input type="hidden" name="scope" value="basic">
										<button type="submit"><?php
											echo $token_instagram ? 'OK' : 'Connect';
										?></button>
									</div>
								</form>
							</td>
						</tr>
					</table>
					<?php
				}
				?>
			</div>
		</div>
	</body>
</html>
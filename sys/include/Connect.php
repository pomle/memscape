<?php
$env = $Env->getVariables();

require HEAD;
?>
<fieldset>
	<legend>Spotify (<?php echo isset($User->tokens['spotify']) ? 'OK' : '-'; ?>)</legend>

	<form action="https://accounts.spotify.com/authorize/" METHOD="GET">
		<input type="hidden" name="client_id" value="<?php echo $env['spotify_client_id']; ?>">
		<input type="hidden" name="redirect_uri" value="<?php echo BASE_URI, $env['spotify_redirect_uri']; ?>">
		<input type="hidden" name="response_type" value="code">
		<input type="hidden" name="scope" value="user-library-read user-read-private">
		<button type="submit">Authorize</submit>
	</form>
</fieldset>

<fieldset>
	<legend>Instagram (<?php echo isset($User->tokens['instagram']) ? 'OK' : '-'; ?>)</legend>

	<form action="https://api.instagram.com/oauth/authorize/" METHOD="GET">
		<input type="hidden" name="client_id" value="<?php echo $env['instagram_client_id']; ?>">
		<input type="hidden" name="redirect_uri" value="<?php echo BASE_URI, $env['instagram_redirect_uri']; ?>">
		<input type="hidden" name="response_type" value="code">
		<input type="hidden" name="scope" value="basic">
		<button type="submit">Authorize</submit>
	</form>
</fieldset>
<?
require FOOT;
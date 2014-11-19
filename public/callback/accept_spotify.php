<?php
require __DIR__ . '/../../sys/init.php';

use Momentus\Auth;
use Momentus\API\Client\Spotify as SpotifyAPI;

$code = $_GET['code'];

$env = $Env->getVariables();

$spotifyAuth = new Auth($env['spotify_client_id'], $env['spotify_client_secret'], BASE_URI . $env['spotify_redirect_uri']);

$User->services['spotify'] = $spotifyAuth->grant('https://accounts.spotify.com/api/token', $code);

$SpotifyAPI = new SpotifyAPI($User->services['spotify']->access_token);
$me = $SpotifyAPI->getMe()->getResponse();

$User->services['spotify']->username = $me->id;

header("Location: /");
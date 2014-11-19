<?php
require __DIR__ . '/../../sys/init.php';

try {
	ini_set("display_errors", 1);
	ini_set("track_errors", 1);
	ini_set("html_errors", 1);
	error_reporting(E_ALL);

	require_once '/usr/share/php/hermes/Hermes.php';
	require '/var/lib/spotify-web/web-core/lib/Spotify/Core/Config.php';
	require '/var/lib/spotify-web/web-core/lib/Spotify/Core/Service.php';
	require '/var/lib/spotify-web/web-core/lib/Spotify/Core/ServiceException.php';
	require '/var/lib/spotify-web/web-core/lib/Spotify/Core/HermesService.php';

	class PlayHistory extends \Spotify\Core\HermesService
	{
		protected $srvName = 'apollo-spotigram';

		public function getPlayHistory($username, $from = null, $to = null)
		{
			$uri = '/v1/history';
			if ($from && $to) {
				$uri .= sprintf('?start=%d&to=%d', $from, $to);
			}
			return $this->call($uri, 'GET', null, $username);
		}
	}

	header("Content-Type: text/plain");

	$username = $User->services['spotify']->username;
	$from = $_GET['from'];
	$to = $_GET['to'];


	$PH = new PlayHistory();
	$PH->addInstance('sto3-apollotunigo-a2.sto3.spotify.net', '5700');
	$response = $PH->getPlayHistory($username, $from, $to);
	echo $response[1];
} catch (\Exception $e) {
	echo $e->getMessage();
}
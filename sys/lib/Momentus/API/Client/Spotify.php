<?php
namespace Momentus\API\Client;

use Asenine\Util\JSON;

class Spotify
{
	public function __construct($accessToken = null)
	{
		$this->accessToken = $accessToken;
	}


	public function applyAuth(SpotifyRequest $r)
	{
		$r->addHeader('Authorization', 'Bearer ' . $this->getAccessToken());
	}

	public function getAccessToken()
	{
		if (is_null($this->accessToken)) {
			throw new \RuntimeException(__METHOD__ . ' requires access token.');
		}

		return $this->accessToken;
	}

	public function getMe()
	{
		$r = new SpotifyRequest('v1/me');
		$this->applyAuth($r);
		return $r;
	}
}

class SpotifyRequest
{
	const SPOTIFY_API_DOMAIN = 'https://api.spotify.com/';

	public function __construct($uri, $method = 'GET')
	{
		$this->uri = $uri;
		$this->method = $method;
		$this->data = [];
		$this->headers = [];
	}

	public function addHeader($k, $v)
	{
		$this->header[$k] = $v;
	}

	public function addData($k, $v)
	{
		$this->data[$k] = $v;
	}

	public function getHeaders()
	{
		$headers = [];
		foreach ($this->header as $k => $v) {
			$headers[] = sprintf('%s: %s', $k, $v);
		}
		return $headers;
	}

	public function execute()
	{
		$uri = self::SPOTIFY_API_DOMAIN . trim($this->uri, '/');

		$curl = curl_init();

		curl_setopt($curl, CURLOPT_HTTPHEADER, $this->getHeaders());

		switch ($this->method) {
			case 'GET';
				if ($this->data) {
					$uri = $uri . '?' . http_build_query($this->data);
				}
				curl_setopt($curl, CURLOPT_URL, $uri);
				curl_setopt($curl, CURLOPT_HTTPGET, 1);
				break;

			case 'POST':
				curl_setopt($curl, CURLOPT_URL, $uri);
				curl_setopt($curl, CURLOPT_POST, 1);
				if ($this->data) {
					curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($this->data));
				}
				break;

			default:
				throw new \InvalidArgumentException("Method '{$this->method}' not recognized.");
		}

		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		//curl_setopt($curl, CURLOPT_HEADER, true);
		//curl_setopt($curl, CURLINFO_HEADER_OUT, true);
		$result = curl_exec($curl);
		$info = curl_getinfo($curl);
		curl_close($curl);

		if (200 !== $info['http_code']) {
			throw new \Exception('HTTP Request failed: ' . $result);
		}

		return $result;
	}

	public function getResponse()
	{
		return JSON::decode($this->execute());
	}
}
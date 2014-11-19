<?php
namespace Momentus;

use Asenine\Util\JSON;

class Auth
{
	public function __construct($client_id, $client_secret, $redirect_uri)
	{
		$this->client_id = $client_id;
		$this->client_secret = $client_secret;
		$this->redirect_uri = $redirect_uri;
	}


	public function grant($url, $code)
	{
		$c = curl_init($url);
		curl_setopt($c, CURLOPT_POST, true);
		curl_setopt($c, CURLOPT_POSTFIELDS, http_build_query(array(
			'grant_type' => 'authorization_code',
			'code' => $code,
			'redirect_uri' => $this->redirect_uri,
			'client_id' => $this->client_id,
			'client_secret' => $this->client_secret
		)));
		curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
		//curl_setopt($c, CURLOPT_HEADER, true);
		//curl_setopt($c, CURLINFO_HEADER_OUT, true);
		$result = curl_exec($c);
		$info = curl_getinfo($c);
		$responseObject = JSON::decode($result);

		if (200 !== $info['http_code']) {
			throw new \Exception($responseObject->error);
		}

		return $responseObject;
	}
}
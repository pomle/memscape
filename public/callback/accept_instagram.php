<?php
require __DIR__ . '/../../sys/init.php';

use Momentus\Auth;

$code = $_GET['code'];

$env = $Env->getVariables();

$instagramAuth = new Auth($env['instagram_client_id'], $env['instagram_client_secret'], BASE_URI . $env['instagram_redirect_uri']);

$User->services['instagram'] = $instagramAuth->grant('https://api.instagram.com/oauth/access_token', $code);

header("Location: /");
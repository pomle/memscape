<?php
function __autoload($class)
{
	$path = __DIR__ . '/lib/' . str_replace('\\', '/', $class) . '.php';
	require $path;
}

function exception_error_handler($errno, $errstr, $errfile, $errline ) {
	throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
}
set_error_handler("exception_error_handler");



use Momentus\Session\User as UserSession;

session_set_cookie_params(60*60*24*30);
session_start();

$User = UserSession::get();

header("Content-Type: text/plain");

define('PATH_SYS', __DIR__ . '/');

define('DOMAIN', 'memory-lane.pom.cloud.spotify.net');
define('BASE_URI', 'http://' . DOMAIN . '/');

define('PATH_INCLUDE', PATH_SYS . 'include/');

define('HEAD', PATH_INCLUDE . 'Head.php');
define('FOOT', PATH_INCLUDE . 'Foot.php');

$PDO = new PDO('sqlite:' . __DIR__ . '/../resource/momentus.sqlite');
$DB = new Asenine\Database\Connection($PDO);

$Env = new Momentus\Env($DB);
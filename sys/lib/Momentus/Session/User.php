<?php
namespace Momentus\Session;

use Momentus\Entity\User as Entity;

class User
{
	public static $sessionName;

	public static function get()
	{
		if (!isset($_SESSION[self::$sessionName]) || !$_SESSION[self::$sessionName] instanceof Entity) {
			self::set(new Entity());
		}
		return $_SESSION[self::$sessionName];
	}

	public static function set(Entity $User)
	{
		$_SESSION[self::$sessionName] = $User;
	}
}
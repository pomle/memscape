<?php
namespace Momentus;

use Asenine\Database\Connection as DB;

class Env
{
	public function __construct(DB $DB)
	{
		$this->DB = $DB;
	}


	public function getVariables($filter = null)
	{
		$Result = $this->DB->execute("SELECT name, value FROM env
			WHERE name LIKE %s OR 0 = %d", $filter, is_string($filter));
		foreach ($Result as $row) {
			$env[$row['name']] = $row['value'];
		}
		return $env;
	}
}
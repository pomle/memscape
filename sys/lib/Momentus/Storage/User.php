<?php
namespace Momentus\Storage;

use Momentus\Entity\User as Entity;
use Asenine\DataIO;

class User extends DataIO\DB
{
	public function fetch(array $userIds)
	{
		$users = [];

		$Result = $this->DB->execute("SELECT * FROM users WHERE id IN %a", $userIds);
		foreach ($Result as $row) {
			$User = new Entity();
			$User->userId = (int)$row['id'];
			$User->uuid = $row['uuid'];
			$User->timeCreated = new \DateTime($row['time_created']);
			$users[$User->userId] = $User;
		}

		$Result = $this->DB->execute("SELECT * FROM user_services WHERE user_id IN %a", $userIds);
		foreach ($Result as $row) {
			$users[(int)$row['user_id']]->tokens[$row['service']] = json_decode($row['response']);
		}

		return $users;
	}

	public function store(array $users)
	{
		foreach ($users as $User) {
			if (!$User->userID) {
				$uuid = exec('uuid');
				$date = new \DateTime();
				$this->DB->execute("INSERT INTO users (id, uuid, time_created)
					VALUES(NULL, %s, %t)", $uuid, $date);
				$User->userID = (int)$this->DB->lastInsertId();
				$User->timeCreated = $date;
			}

			/* Update clause here. */
		}
	}
}
<?php


$REMOTE = false;
//$REMOTE = true;

switch ($REMOTE) {

	case true :
		$DB_CONNECTION = new MysqliDb ( 'mysql_address', 'db_user', 'pw', 'db_name' );
		break;

	case false :
		$DB_CONNECTION = new MysqliDb ('localhost', 'root', 'root', 'kanban');
		break;

	default :
		break;
}

?>
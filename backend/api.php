<?php
require_once 'PHP-MySQLi-Database-Class-master/MysqliDb.php';
include("apiSettings.php");
include("apiHelpers.php");


class KanbanAPI {

    var $db;

    // Constructor - open DB connection
    function __construct($db) {
		$this->db = $db;
    }

    // Destructor - close DB connection
    function __destruct() {
        $this->db->close();
    }

    function store($json) {
        if ($json == ''){
            sendResponse(400, 'No valid Json received and stored');
            return false;
        }
        sendResponse(200, 'Json received ');
        $data = Array (
            'json' => $json
        );
        $this->db->where ('id', 1);
        if ($this->db->update ('kanban', $data))
            sendResponse(200, 'Json stored ');
        else
            sendResponse(400, 'ERROR: could not store json ');
                
        return true;
    }
    
    function load() {
        $this->db->where ("id", 1);
        $result = $this->db->getOne ("kanban");
        sendResponse(200, $result['json']);
        return true;
    }
        
}

// This is the first thing that gets called when this page is loaded

// var_dump($_SERVER['REQUEST_METHOD']);
// var_dump($_SERVER['REQUEST_URI']);
// var_dump($_SERVER['PATH_INFO']);

if (($stream = fopen('php://input', "r")) !== FALSE)
    $content = stream_get_contents($stream);
// var_dump($content);

// can be used in future maybe. Now storing raw json string
// $json = json_decode($content, false);

// db connection
$db = $DB_CONNECTION;

$api = new KanbanAPI($db);
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
        
    case "GET":
        $api->load();
        break;
        
    case "POST":
        $api->store($content);
        break;
        
    default:
        sendResponse(400, 'ERROR: method not supported ');
        break;
}
?>
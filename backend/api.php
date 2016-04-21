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

    function store($json, $timestamp, $servertimestamp) {
        if ($json == ''){
            sendResponse(400, 'No valid Json received and stored');
            return false;
        }
        sendResponse(200, 'Json received ');
        $data = Array (
            'json' => $json,
            'timestamp' => $timestamp,
            'servertimestamp' => $servertimestamp
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
        $jsonObject = json_decode($result['json'], false);
        // add servertimestamp to result to send back as response
        $jsonObject = (object) array_merge( (array)$jsonObject, array( 'servertimestamp' => $result['servertimestamp'] ) );
        $jsonResult = json_encode($jsonObject);
        sendResponse(200, $jsonResult);
        return true;
    }
    
    function servertimelastsave() {
        $this->db->where ("id", 1);
        $result = $this->db->getOne ("kanban");
        $jsonObject = (object) array('servertimestamp' => $result['servertimestamp'] );
        $jsonResult = json_encode($jsonObject);
        sendResponse(200, $jsonResult);
        return true;
    }
    
    function usertimelastsave() {
        $this->db->where ("id", 1);
        $result = $this->db->getOne ("kanban");
        $jsonObject = (object) array('usertimestamp' => $result['timestamp'] );
        $jsonResult = json_encode($jsonObject);
        sendResponse(200, $jsonResult);
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

// Now storing raw json string
// Only decode for timestamp
$json = json_decode($content, false);
$timestamp = $json->timestamp;
$serverTime = intval(microtime(true)*1000);

// db connection
$db = $DB_CONNECTION;

$api = new KanbanAPI($db);
$method = $_SERVER['REQUEST_METHOD'];
$requestEndPoint = end(explode("/", $_SERVER['REQUEST_URI']));

switch ($method) {
        
    case "GET":
        
        switch ($requestEndPoint) {
            
            case "servertimelastsave":
                $api->servertimelastsave();
            break;
                
            case "usertimelastsave":
                $api->usertimelastsave();
            break;    
            
            default:
                $api->load();
            break;
            
        }

        break;
        
    case "POST":
        $api->store($content, $timestamp, $serverTime);
        break;
        
    default:
        sendResponse(400, 'ERROR: method not supported ');
        break;
}
?>
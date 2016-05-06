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

    function savecard($json){
        sendResponse(200, 'save card called.. the following was received - '.$json);
    }

    function deletecard($json){
        sendResponse(200, 'delete card called.. the following was received - '.$json);
    }

    function savecolumn($json){
        sendResponse(200, 'save column called.. the following was received - '.$json);
    }

    function deletecolumn($json){
        sendResponse(200, 'delete column called.. the following was received - '.$json);
    }

    function saveusers($json){
        sendResponse(200, 'save users called.. the following was received - '.$json);
    }

    function savearchive($json){
        sendResponse(200, 'save archive called.. the following was received - '.$json);
    }

    function savesettings($json){
        sendResponse(200, 'save settings called.. the following was received - '.$json);
    }

    function store($kanbanId, $json, $timestamp, $servertimestamp, $browser) {
        if ($json == ''){
            sendResponse(400, 'No valid Json received and stored');
            return false;
        }
        sendResponse(200, 'Json received ');
        $data = Array (
            'json' => $json,
            'timestamp' => $timestamp,
            'servertimestamp' => $servertimestamp,
            'browser' => $browser
        );
        $this->db->where ('id', $kanbanId);
        if ($this->db->update ('kanban', $data))
            sendResponse(200, 'Single Json stored ');
        else
            sendResponse(400, 'ERROR: could not store Single json ');

        $dataAll = Array (
            'timestamp' => $timestamp,
            'servertimestamp' => $servertimestamp,
            'browser' => $browser
        );
        $this->db->where ('id', 1);
        if ($this->db->update ('kanbanAll', $data))
            sendResponse(200, 'server timestamp stored ');
        else
            sendResponse(400, 'ERROR: could not store server timestamp ');
                
        return true;
    }

    function load($id) {
        $this->db->where ("id", $id);
        $result = $this->db->getOne ("kanban");
        $jsonObject = json_decode($result['json'], false);
        $singleKanbanResult = $jsonObject;
        // add servertimestamp to result to send back as response
        $singleKanbanResult = (object) array_merge( (array)$singleKanbanResult, array( 'servertimestamp' => $result['servertimestamp'] ) );
        $jsonResult = json_encode($singleKanbanResult);
        sendResponse(200, $jsonResult, 'application/json');
        return true;
    }
        
    function servertimelastsave() {
        $this->db->where ("id", 1);
        $result = $this->db->getOne ("kanbanAll");
        $jsonObject = (object) array(
                'servertimestamp' => $result['servertimestamp'],
                'browser' => $result['browser'],
            );
        $jsonResult = json_encode($jsonObject);
        sendResponse(200, $jsonResult, 'application/json');
        return true;
    }
    
    function usertimelastsave() {
        $this->db->where ("id", 1);
        $result = $this->db->getOne ("kanbanAll");
        $jsonObject = (object) array(
                'usertimestamp' => $result['timestamp'],
                'browser' => $result['browser'],
            );
        $jsonResult = json_encode($jsonObject);
        sendResponse(200, $jsonResult, 'application/json');
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
$kanbanId = $json->singlekanban->id;
$timestamp = $json->timestamp;
$browser = $json->browser;
$serverTime = intval(microtime(true)*1000);

// db connection
$db = $DB_CONNECTION;

$api = new KanbanAPI($db);
$method = $_SERVER['REQUEST_METHOD'];
$requestEndPoint = end(explode("/", $_SERVER['REQUEST_URI']));
// var_dump($requestEndPoint);

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
                $api->load($requestEndPoint);
            break;
            
        }

        break;
        
    case "POST":

        switch ($requestEndPoint) {

            case "savecard":
                $api->savecard($content);
            break;

            case "deletecard":
                $api->deletecard($content);
            break;

            case "savecolumn":
                $api->savecolumn($content);
            break;

            case "deletecolumn":
                $api->deletecolumn($content);
            break;

            case "saveusers":
                $api->saveusers($content);
            break;

            case "savearchive":
                $api->savearchive($content);
            break;

            case "savesettings":
                $api->savesettings($content);
            break;

            default:
                sendResponse(400, 'ERROR: endpoint not known ');
            break;

        }

        break;
        
    default:
        sendResponse(400, 'ERROR: method not supported ');
        break;
}
?>
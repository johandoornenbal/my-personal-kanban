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

    function storeAll($json, $timestamp, $servertimestamp, $browser) {
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
        $this->db->where ('id', 1);
        if ($this->db->update ('kanbanAll', $data))
            sendResponse(200, 'Json stored ');
        else
            sendResponse(400, 'ERROR: could not store json ');
                
        return true;
    }
    
    function updateOrCreate($id, $json, $timestamp, $servertimestamp, $browser) {
        if ($json == ''){
            sendResponse(400, 'No valid Json received and stored');
            return false;
        }
        sendResponse(200, 'Json received ');
        $this->db->where ("id", $id);
        $result = $this->db->getOne ("kanban");
        if ($result) {
            $data = Array (
            'json' => $json,
            'timestamp' => $timestamp,
            'servertimestamp' => $servertimestamp,
            'browser' => $browser,
            'event' => 'UPDATE',
            'eventdetails' =>  $id  
            );
            $this->db->where ('id', $id);
            if ($this->db->update ('kanban', $data))
            {
                sendResponse(200, 'Json updated ');
            } else {
                sendResponse(400, 'ERROR: could not update json ');
            }
        } 
        else 
        {
            unset($this->db->where);
            $insertData = Array (
                'id' => $id,
                'json' => $json,
                'timestamp' => $timestamp,
                'servertimestamp' => $servertimestamp,
                'browser' => $browser,
                'event' => 'CREATE',
                'eventdetails' => '' 
            );
            if ($this->db->insert ('kanban', $insertData)) {
                sendResponse(200, 'Json stored ');
            } else {
                sendResponse(400, 'ERROR: could not store new json ');
            }
        }
                
        return true;
    }
    
    function deleteNotInArray($allKanbanIds){
        $allKanbans = $this->db->get ("kanban");
        foreach($allKanbans as $storedKanban){
            if(!in_array($storedKanban["id"], $allKanbanIds )) {
                $this->db->where('id', $storedKanban["id"]);
                $this->db->delete('kanban');
            }
        }
        return true;
    }

    function loadAll() {
        $this->db->where ("id", 1);
        $allKanbanResult = $this->db->getOne ("kanbanAll");

        unset($this->db->where);
        $allKanbans = $this->db->get ("kanban");
        foreach ($allKanbans as $kanban){
            $kanbanObj = json_decode($kanban['json'], false);
            $name=$kanbanObj->singlekanban->name;
            $kanbansResult->kanbans->$name = $kanbanObj->singlekanban;
        }
        $kanbansResult = (object) array_merge((array)$kanbansResult, array( 'timestamp' => $allKanbanResult['timestamp'] ));
        $kanbansResult = (object) array_merge((array)$kanbansResult, array( 'servertimestamp' => $allKanbanResult['servertimestamp'] ));
        $jsonResult = json_encode($kanbansResult);
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
$timestamp = $json->timestamp;
$browser = $json->browser;
$allKanbans = array();
foreach ($json->kanbans as $kanban){
    $allKanbans[] = $kanban;
}
$serializedKanbansByUUID = serialize($kanbansByUUID);
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
                $api->loadAll();
            break;
            
        }

        break;
        
    case "POST":
        $api->storeAll($content, $timestamp, $serverTime, $browser);
        foreach($allKanbans as $kanban){
            $resultObj->singlekanban = $kanban;
            $json = json_encode($resultObj);
            $api->updateOrCreate($kanban->id, $json, $timestamp, $serverTime, $browser);
        }
        // delete kanbans that are not present in array allKanbanIds
        $allKanbanIds = array();
        foreach($allKanbans as $kanban){
            $resultObj->singlekanban = $kanban;
            $allKanbanIds[] = $kanban->id;
        }
        // only delete if not the last one
        if (count($allKanbanIds) > 0){
            $api->deleteNotInArray($allKanbanIds);
        }
        
        break;
        
    default:
        sendResponse(400, 'ERROR: method not supported ');
        break;
}
?>
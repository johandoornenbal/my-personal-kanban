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
    
        
    function getkanban($kanbanId){   
        $this->db->where ("id", $kanbanId);
        $result = $this->db->getOne ("kanban");
        
        //TODO: create Json from kanban, columns and cards
        
        $kanbanObj = json_decode($result["json"]);
        // var_dump($kanbanObj->users);
        
        $users = Array();
        if (isset($kanbanObj->users)){
            $users = $kanbanObj->users;
        }
        $settings = new stdClass();
        if (isset($kanbanObj->settings)){
            $settings = $kanbanObj->settings;
        }
        $archived = Array();
        if (isset($kanbanObj->archived)){
            $archived = $kanbanObj->archived;
        }
        
        $columnIds = json_decode($result["columns"]);
        // var_dump($columnIds);
        
        $columnsForExport = Array();
        $i=0;
        foreach($columnIds as $columnId){
            $this->db->where ("id", $columnId);
            $column_result = $this->db->getOne ("kanbanColumn");
            if ($column_result) {
                $singleColumn = json_decode($column_result["json"]);
                $cardsForExport = Array();
                foreach($singleColumn->cards as $cardId){
                    $this->db->where ("id", $cardId);
                    $card_result = $this->db->getOne ("card");
                    /*filter some values in order to prevent perpetual change*/
                    $cardObj = json_decode($card_result["json"]);
                    unset($cardObj->browser);
                    unset($cardObj->lastChange);
                    unset($cardObj->kanbanId);
                    $cardsForExport[] = $cardObj;
                }
                $columnsForExport[$i]->id = $singleColumn->id;
                $columnsForExport[$i]->name = $singleColumn->name;
                $columnsForExport[$i]->settings = $singleColumn->settings;
                $columnsForExport[$i]->cards = $cardsForExport;                
            }     
            $i++;
        }
        
        $kanban = Array(
            "id" => $kanbanId, 
            "name" =>$result["name"], 
            "numberOfColumns" => $result["numberOfColumns"],
            "columns" => $columnsForExport,
            "users" => $users,
            "settings" => $settings,
            "archived" => $archived
        );
        
        $payload = Array(
            "singlekanban" => $kanban
        );
        
        if ($result) {
            $json = json_encode($payload);
            sendResponse(200, $json);
        } else {
            sendResponse(400, "kanban not found");
        }
    }

    function savecard($json){
        
        if ($json == ''){
            sendResponse(400, 'No valid Json received and stored');
            return false;
        }
        
        $card = json_decode($json, false);
        
        /* set some defaults */
        if (isset($card->createdOn)){
            $createdOn = $card->createdOn;
        } else {
            $createdOn = 0;
        }
        if (isset($card->lastChange)){
            $lastChange = $card->lastChange;
        } else {
            $lastChange = 0;
        }
        $owner = json_encode($card->owner);
        $serverTime = intval(microtime(true)*1000);
        
        /* test if card exists */
        $this->db->where ("id", $card->id);
        $result = $this->db->getOne ("card");
        
        /* if exists then update card */
        if ($result) {
            
            $updateData = Array (
                'name' => $card->name,
                'description' => $card->details,
                'color' => $card->color,
                'owner' => $owner,
                'createdOn' => $createdOn,
                'lastChange' => $serverTime,
                'json' => $json,
                'kanban' => $card->kanbanId
            );
            $this->db->where ('id', $card->id);
            if ($this->db->update ('card', $updateData))
            {
                $event = "CARD_UPDATE";
                sendResponse(200, 'Card updated ');
            } else {
                $event = "FAILED_CARD_UPDATE";
                sendResponse(400, 'ERROR: could not update card ');
            }
            
        } else {
        
        /* else create card */
            
            $insertData = Array (
                'id' => $card->id,
                'name' => $card->name,
                'description' => $card->details,
                'color' => $card->color,
                'owner' => $owner,
                'createdOn' => $createdOn,
                'lastChange' => $lastChange,
                'json' => $json,
                'kanban' => $card->kanbanId
            );
            if ($this->db->insert ('card', $insertData)) {
                $event = "CARD_CREATE";
                sendResponse(200, 'Card stored ');
            } else {
                $event = "FAILED_CARD_CREATE";
                sendResponse(400, 'ERROR: could not store card ');
            }
        }
        
        /* update kanban with timestamp and event details */
        $this->db->where ("id", $card->kanbanId);
        $update = Array (
            'servertimestamp' => intval(microtime(true)*1000),
            'browser' => $card->browser,
            'event' => $event,
            'eventdetails' => $card->id
        );
        $result = $this->db->update ("kanban", $update);
        
    }

    function deletecard($json){
        
        $cardToDelete = json_decode($json, false);
        $this->db->where ("id", $cardToDelete->cardId);
        $result = $this->db->delete('card');
        if ($result) {
            $event = "CARD_DELETE";
            sendResponse(200, 'delete card called and executed.. the following was received - '.$json);
        } else {
            $event = "FAILING_CARD_DELETE";
            sendResponse(400, 'ERROR deleting card .. the following was received - '.$json);
        }
        
        /* update kanban with timestamp and event details */
        $this->db->where ("id", $cardToDelete->kanbanId);
        $update = Array (
            'servertimestamp' => intval(microtime(true)*1000),
            'browser' => $cardToDelete->browser,
            'event' => $event,
            'eventdetails' => $cardToDelete->id
        );
        $result = $this->db->update ("kanban", $update);
        
    }

    function savecolumn($json){
        
        if ($json == ''){
            sendResponse(400, 'No valid Json received and stored');
            return false;
        }

        $column = json_decode($json, false);
        // var_dump($column);
         
        /* prepare cards */
        $cards = json_encode($column->cards);
        
        /* prepare settings */
        $settings = json_encode($column->settings);
        
        /* test if column exists */
        $this->db->where ("id", $column->id);
        $result = $this->db->getOne ("kanbanColumn");
        
        /* if exists then update column */
        if ($result) {
            
            $updateData = Array (
                'name' => $column->name,
                'cards' => $cards,
                'settings' => $settings,
                'json' => $json,
                'kanban' => $column->kanbanId
            );
            $this->db->where ('id', $column->id);
            if ($this->db->update ('kanbanColumn', $updateData))
            {
                $event = "COLUMN_UPDATE";
                sendResponse(200, 'Column updated ');
            } else {
                $event = "FAILED_COLUMN_UPDATE";
                sendResponse(400, 'ERROR: could not update column ');
            }
            
        } else {
            
        /* else create column */    
            $insertData = Array (
                'id' => $column->id,
                'name' => $column->name,
                'cards' => $cards,
                'settings' => $settings,
                'json' => $json,
                'kanban' => $column->kanbanId
            );
            //var_dump($insertData);
            if ($this->db->insert('kanbanColumn', $insertData)) {
                $event = "COLUMN_CREATE";
                sendResponse(200, 'Column stored ');
            } else {
                $event = "FAILED_COLUMN_CREATE";
                sendResponse(400, 'ERROR: could not store column ');
            }            
        }
        
        /* update kanban with timestamp and event details */
        $this->db->where ("id", $column->kanbanId);
        $update = Array (
            'servertimestamp' => intval(microtime(true)*1000),
            'browser' => $column->browser,
            'event' => $event,
            'eventdetails' => $column->id
        );
        $result = $this->db->update ("kanban", $update);        

    }

    function deletecolumn($json){
        
        $columnToDelete = json_decode($json, false);
        $this->db->where ("id", $columnToDelete->columnId);
        $result = $this->db->delete('kanbanColumn');
        if ($result) {
            $event = "COLUMN_DELETE";
            sendResponse(200, 'delete column called and executed.. the following was received - '.$json);
        } else {
            $event = "FAILING_COLUMN_DELETE";
            sendResponse(400, 'ERROR deleting column .. the following was received - '.$json);
        }
        
        /* update kanban with timestamp and event details */
        $this->db->where ("id", $columnToDelete->kanbanId);
        $update = Array (
            'servertimestamp' => intval(microtime(true)*1000),
            'browser' => $columnToDelete->browser,
            'event' => $event,
            'eventdetails' => $columnToDelete->id
        );
        $result = $this->db->update ("kanban", $update);
        
    }

    function saveusers($json){
        
        $kanban = json_decode($json, false);
        $this->db->where ("id", $kanban->id);
        $update = Array (
            'name' => $kanban->name,
            'numberOfColumns' => $kanban->numberOfColumns,
            'columns' => json_encode($kanban->columns),
            'settings' => '', //todo: settings dummy for the moment
            'json' => $json,
            'servertimestamp' => intval(microtime(true)*1000),
            'browser' => $kanban->browser,
            'event' => "USER_UPDATE",
            'eventdetails' => $kanban->id
        );
        $result = $this->db->update ("kanban", $update);
        if ($result){
            sendResponse(200, 'save users called and executed .. the following was received - '.$json);
        } else {
            sendResponse(400, 'ERROR saving users .. the following was received - '.$json);
        }
        
    }

    function savearchive($json){
        
        $kanban = json_decode($json, false);
        $this->db->where ("id", $kanban->id);
        $update = Array (
            'name' => $kanban->name,
            'numberOfColumns' => $kanban->numberOfColumns,
            'columns' => json_encode($kanban->columns),
            'settings' => '', //todo: settings dummy for the moment
            'json' => $json,
            'servertimestamp' => intval(microtime(true)*1000),
            'browser' => $kanban->browser,
            'event' => "ARCHIVE_UPDATE",
            'eventdetails' => $kanban->id
        );
        $result = $this->db->update ("kanban", $update);
        if ($result){
            sendResponse(200, 'save archive called and executed .. the following was received - '.$json);
        } else {
            sendResponse(400, 'ERROR saving archive .. the following was received - '.$json);
        }
        
    }

    function savesettings($json){
        
        $kanban = json_decode($json, false);
        $this->db->where ("id", $kanban->id);
        $update = Array (
            'name' => $kanban->name,
            'numberOfColumns' => $kanban->numberOfColumns,
            'columns' => json_encode($kanban->columns),
            'settings' => '', //todo: settings dummy for the moment
            'json' => $json,
            'servertimestamp' => intval(microtime(true)*1000),
            'browser' => $kanban->browser,
            'event' => "SETTINGS_UPDATE",
            'eventdetails' => $kanban->id
        );
        $result = $this->db->update ("kanban", $update);
        if ($result){
            sendResponse(200, 'save settings called and executed .. the following was received - '.$json);
        } else {
            sendResponse(400, 'ERROR saving settings .. the following was received - '.$json);
        }
        
    }
    
    function updatekanban($json){
        
        $kanban = json_decode($json, false);
        $this->db->where ("id", $kanban->id);
        $update = Array (
            'name' => $kanban->name,
            'numberOfColumns' => $kanban->numberOfColumns,
            'columns' => json_encode($kanban->columns),
            'settings' => '', //todo: settings dummy for the moment
            'json' => $json,
            'servertimestamp' => intval(microtime(true)*1000),
            'browser' => $kanban->browser,
            'event' => "SETTINGS_UPDATE",
            'eventdetails' => $kanban->id
        );
        $result = $this->db->update ("kanban", $update);
        if ($result){
            sendResponse(200, 'save settings called and executed .. the following was received - '.$json);
        } else {
            sendResponse(400, 'ERROR saving settings .. the following was received - '.$json);
        }
        
    }
    
    function getcard($cardId){   
        $this->db->where ("id", $cardId);
        $result = $this->db->getOne ("card");
        if ($result) {
            $json = $result["json"];
            sendResponse(200, $json);
        } else {
            sendResponse(400, "card not found");
        }
    }
    
    function getcolumn($columnId){   
        $this->db->where ("id", $columnId);
        $result = $this->db->getOne ("kanbanColumn");
        if ($result) {
            $json = $result["json"];
            sendResponse(200, $json);
        } else {
            sendResponse(400, "column not found");
        }
    }
    
    function getpoll($kanbanId) {
        $this->db->where ("id", $kanbanId);
        if ($result = $this->db->getOne ("kanban")){
            $jsonObject = (object) array(
                    'servertimestamp' => $result['servertimestamp'],
                    'browser' => $result['browser'],
                    'event' => $result['event'],
                    'eventdetails' => $result['eventdetails']
                );
            $jsonResult = json_encode($jsonObject);
            sendResponse(200, $jsonResult, 'application/json');
            return true;
        } else {
            sendResponse(400, "ERROR: kanban not found");
            return false;
        }
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
$uriArr = explode("/", $_SERVER['REQUEST_URI']);
$requestEndPoint = array_pop($uriArr);
//var_dump($requestEndPoint);
$requestEndPointBefore = end($uriArr);
//var_dump($requestEndPointBefore);

switch ($method) {
        
    case "GET":
        
        switch ($requestEndPointBefore) {
                
            case "card":
                $api->getcard($requestEndPoint);
            break;    
        
            case "column":
                $api->getcolumn($requestEndPoint);
            break;                  
                
            case "kanban":
                $api->getkanban($requestEndPoint);
            break;
            
            case "poll":
                $api->getpoll($requestEndPoint);
            break;    
                
            default:
                
                switch ($requestEndPoint) {

                    default:
                        sendResponse(400, 'ERROR: endpoint not known ');
                    break;

                }

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

            case "updatekanban":
                $api->updatekanban($content);
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
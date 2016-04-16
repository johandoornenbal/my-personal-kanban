<?php

require_once 'PHP-MySQLi-Database-Class-master/MysqliDb.php';
include("apiSettings.php");
include_once '../classes/Translator.php';
include("apiHelpers.php");

class BestellingenAPI {

    var $db;

    // Constructor - open DB connection
    function __construct($db) {
		$this->db = $db;
    }

    // Destructor - close DB connection
    function __destruct() {
        $this->db->close();
    }

    // Main method to get bestellingen
    function bestellingen() {
    
        // Check for required parameters
        if (isset($_GET["laatste_nummer"]) && isset($_GET["inez"]) && $_GET["inez"]=="cool") {
        
            // Put parameters into local variables
            $laatste_nummer = $_GET["laatste_nummer"];
            $cols = Array ("nummer", 
            		"turnster", 
            		"leeftijd",
            		"kledingmaat",
            		"lengte",
            		"postuur",
            		"pakje",
            		"mouwtje", 
            		"broekje", 
            		"kleurbroekje", 
            		"elastiek", 
            		"opmerkingen", 
            		"naam", 
            		"straat", 
            		"postcode", 
            		"plaats", 
            		"telefoon", 
            		"email", 
            		"vragen", 
            		"datum");
            $bestellingen = $this->db->get("bestellingen", null, $cols);
            foreach ($bestellingen as $bestelling) {
                if ($bestelling[nummer] > $laatste_nummer) {
                	//try to find prices
                	$pakjeId=$this->findPakjeId($bestelling[pakje]);
                	
                    $result[] = array("nummer" => $bestelling["nummer"],
                                     "turnster" => $bestelling["turnster"],
                                     "leeftijd" => $bestelling["leeftijd"],
                                     "kledingmaat" => $bestelling["kledingmaat"],
                                     "lengte" => $bestelling["lengte"],
                                      "postuur" => $bestelling["postuur"],
                                      "pakje" => $bestelling["pakje"],
                                      "mouwtje" => $bestelling["mouwtje"],
                                      "broekje" => $bestelling["broekje"],
                                      "kleurbroekje" =>$bestelling["kleurbroekje"],
                                      "elastiek" => $bestelling["elastiek"],
                                      "opmerkingen" => $bestelling["opmerkingen"],
                                      "naam" => $bestelling["naam"],
                                      "straat" => $bestelling["straat"],
                                      "postcode" => $bestelling["postcode"],
                                      "plaats" => $bestelling["plaats"],
                                      "telefoon" => $bestelling["telefoon"],
                                      "email" => $bestelling["email"],
                                      "vragen" => $bestelling["vragen"],
                                      "datum" => $bestelling["datum"],
                    				  "pakjeId" =>$pakjeId,
                                     );
                }
            }
            
            sendResponse(200, json_encode($result));
            return true;
        }
        sendResponse(400, 'Invalid request');
        return false;
    
    }

    // Main method to get bestellingen
    function prijzen() {
    
    	// Check for required parameters
    	if (isset($_GET["pakjeId"]) && $_GET["pakjeId"]!=0) {
      		$prijzen=findPrices($_GET["pakjeId"], $this->db, 'NL');
    		sendResponse(200, json_encode($prijzen));
    		return true;
    	}
    	
    	sendResponse(400, 'Invalid request');
    	return false;
    
    }
    
    // helper to find id of pakje
    private function findPakjeId($name) {
    	
    	$cols = Array ("id");
    	$this->db->where ("LOWER(label1)=LOWER('".$name."')");
    	$pakje = $this->db->getOne ("t_2");
    	return $pakje["id"];
    }
        
}

// This is the first thing that gets called when this page is loaded
// Creates a new instance of the BestellingenAPI class and calls the bestellingen method

// db connection
$db = $DB_CONNECTION;
$LANG='NL';

$api = new BestellingenAPI($db);
if (isset($_GET["pakjeId"])) {
	$api->prijzen();
} else {
	$api->bestellingen();
}

?>
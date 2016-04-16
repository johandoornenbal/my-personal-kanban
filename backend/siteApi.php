<?php

require_once 'PHP-MySQLi-Database-Class-master/MysqliDb.php';
include("apiSettings.php");
include("../classes/Translator.php");
include("apiHelpers.php");


class SiteAPI {

    var $db;

    // Constructor - open DB connection
    function __construct($db) {
		$this->db = $db;
    }

    // Destructor - close DB connection
    function __destruct() {
        $this->db->close();
    }

    // Main method to get all pakjes
    function getAllPakjes() {
    
        // Check for required parameters
        if (isset($_GET["inez"]) && $_GET["inez"]=="cool") {
        	
            $colsPakje = Array ("id", 
            		"label1", 
            		"label2",
            		"label3",
            		"label4",
            		"label5",
            		"label6",
            		"label7", 
            		"label8", 
            		"label9", 
            		"label10", 
            		"label11", 
            		"label12", 
            		"label13", 
            		"label14");
            $this->db->where("label8","ja");
            $pakjes = $this->db->get("t_2", null, $colsPakje);
            foreach ($pakjes as $pakje) {
            	//unserialize prijsklassen
            	$prijsKlassePakje = unserialize($pakje ["label11"]);
            	$prijsKlasseBroekje = unserialize($pakje ["label12"]);
            	//get first
            	$prijsKlassePakje = $prijsKlassePakje[0];
            	$prijsKlasseBroekje = $prijsKlasseBroekje[0];
            	//all prices
            	$prijzen = findPrices($pakje["id"], $this->db, '');
				$result [] = array (
						"id" => $pakje["id"],
						"naam" => $pakje["label1"],
						"omschrijvingNL" => $pakje ["label2"],
						"positieSite" => $pakje ["label3"],
						"fotoKlein" => $pakje ["label4"],
						"fotoGroot" => $pakje ["label5"],
						"fotoBoven" => $pakje ["label6"],
						"positieBoven" => $pakje ["label7"],
						"zichtbaarSite" => $pakje ["label8"],
						"extraInfo" => $pakje ["label9"],
						"toonExtraInfo" => $pakje ["label10"],
						"prijsKlassePakje" => $prijsKlassePakje,
						"prijsKlasseBroekje" => $prijsKlasseBroekje,
						"omschrijvingENG" => $pakje ["label13"],
						"omschrijvingDUI" => $pakje ["label14"],
						"prijzen" => $prijzen
				);
                
            }
            
            sendResponse(200, json_encode($result));
            return true;
        }
        sendResponse(400, 'Invalid request');
        return false;
    
    }
        
}

// This is the first thing that gets called when this page is loaded
// Creates a new instance of the BestellingenAPI class and calls the bestellingen method

// db connection
$db = $DB_CONNECTION;
$LANG = "NL";

$api = new SiteAPI($db);
$api->getAllPakjes();

?>
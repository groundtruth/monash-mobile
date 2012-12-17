<?php
/**
 * Process the capture form
 *
 * @param 		string		$prop_num		property number
 * @param 		string		$comments		comments associated to the capture
 * @return 		string						resulting json string for form success / failure processing
 */

# Includes
require_once("../inc/error.inc.php");
require_once("../inc/database.inc.php");
require_once("../inc/security.inc.php");

# Set arguments for error email
$err_user_name = "Herve";
$err_email = "hs.enot@gmail.com";

# Retrieve URL arguments
try {
	$latitude = $_REQUEST['lat'];
	$longitude = $_REQUEST['lon'];
	$pit_type = $_REQUEST['pit_type'];
}
catch (Exception $e) {
    trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
}

# Performs the query and returns XML or JSON
try {
//	$sql = "INSERT INTO msc_capture (prop_num,comments,haz_type,the_geom,longitude,latitude,haz_status) VALUES ('".$prop_num."','".$comments."',".$haz_type.",(select ST_Transform(ST_Centroid(p.the_geom),4326) from dse_vmprop_property p where p.prop_propnum='".$prop_num."'),".$longitude.",".$latitude.",".$haz_status.") RETURNING id";
//	$sql = "INSERT INTO msc_capture (prop_num,comments,haz_type,the_geom,longitude,latitude,haz_status,lga) VALUES ('".$prop_num."','".$comments."',".$haz_type.",(select ST_Transform(ST_Centroid(p.the_geom),4326) from dse_vmprop_property p where p.pr_propnum='".$prop_num."' and p.pr_lgac='".$lga."'),".$longitude.",".$latitude.",".$haz_status.",'".$lga."') RETURNING id";
	$sql = "INSERT INTO wsc_drainage_pit(assetid, typeid, the_geom) VALUES (nextval('wsc_drainage_pit_assetid_seq'), ".$pit_type.", ST_SetSRID(ST_Point(".$longitude.",".$latitude."),4326)) RETURNING ogc_fid";

	$sql = sanitizeSQL($sql);
	$pgconn = pgConnection();

	//echo $sql;

	/*** fetch into an PDOStatement object ***/
    $recordSet = $pgconn->prepare($sql);
    $recordSet->execute();

	require_once("../inc/json.pdo.inc.php");
	header("Content-Type: application/json");

	echo fs2json($recordSet);
}
catch (Exception $e) {
	trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
}

?>
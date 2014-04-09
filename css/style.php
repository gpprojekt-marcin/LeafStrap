<?php

ini_set('display_startup_errors',1);
ini_set('display_errors',1);
error_reporting(-1);

if (isset($_GET['compress'])) {
	$options = array( 'compress'=>true );
} else {
	$options = array( );
}
header("Content-type: text/css");
require('../externals/less-php/Less.php');

$parser = new Less_Parser($options);
$parser->parseFile( './style.less');
$css = $parser->getCss();
echo $css;

?>
<?php
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
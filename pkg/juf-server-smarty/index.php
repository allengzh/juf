<?php
date_default_timezone_set("PRC");

define('CURRENT_DIR', dirname(__FILE__));
define('SMARTY_DIR', CURRENT_DIR . '/libs/');
require_once(SMARTY_DIR . 'Smarty.class.php');
$smarty = new Smarty();

$smarty->setTemplateDir(CURRENT_DIR . '/views/');
$smarty->setCompileDir(CURRENT_DIR . '/templates_c/');
$smarty->setConfigDir(CURRENT_DIR . '/configs/');
$smarty->setCacheDir(CURRENT_DIR . '/cache/');
$smarty -> left_delimiter="<{";
$smarty -> right_delimiter="}>";

$path = preg_replace('/\/index\.php\//', '', $_SERVER['REQUEST_URI']);
$path = preg_replace('/\?.*/i', "", $path);

$last = substr ($path, -1);
$filelast = substr($path, -4);

if($last === '/'){
	$path = $path . 'index';
}

if($filelast === '.tpl'){
	$path = rtrim($path,'.tpl');
}

$page = $path.'.tpl';
$json = $path.'.json';
$file = CURRENT_DIR . '/test/'.$json;

if(file_exists($file)){
	$tplData = json_decode(file_get_contents($file), true);
	foreach ($tplData as $key => $data) {
	  $smarty->assign($key, $data);
	}
}

$smarty->display($page);
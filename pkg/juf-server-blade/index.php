<?php
date_default_timezone_set("PRC");

define('CURRENT_DIR', dirname(__FILE__));
define('BLADE_DIR', CURRENT_DIR . '/libs/');

require_once(BLADE_DIR . '/Compilers/BladeCompiler.php');
require_once(BLADE_DIR . '/Engines/CompilerEngine.php');
require_once(BLADE_DIR . 'FileViewFinder.php');
require_once(BLADE_DIR . 'Factory.php');
require_once(BLADE_DIR . 'helpers.php');

$dirPath = [CURRENT_DIR . '/views/'];         // your view file path, it's an array
$cachePath = CURRENT_DIR . '/templates_c/';     // compiled file path

$compiler = new \Blade\Compilers\BladeCompiler($cachePath);

$engine = new \Blade\Engines\CompilerEngine($compiler);
$finder = new \Blade\FileViewFinder($dirPath);

// if your view file extension is not php or blade.php, use this to add it
$finder->addExtension('tpl');

// get an instance of factory
$factory = new \Blade\Factory($engine, $finder);

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
	echo $factory->make($path, $tplData)->render();
}else{
	echo $factory->make($path)->render();
}
<?php

namespace Adb;



$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)
);

if ($uri !== '/' && file_exists(__DIR__.'/public'.$uri)) {
    header('Location: public/guitar-interactive-base.php');
    require_once __DIR__.'/public/guitar-interactive-base.php';   
    exit();
    
}
else {
    header('Location: public/guitar-interactive-base.php');
    require_once __DIR__.'/public/guitar-interactive-base.php';
    exit();
    
}

 


?>

<?php session_start(); 
require_once('utils.php'); 

$error = null; 
$user = null; 

// try to login if the form was submitted 
if (isset($_POST['pass'])) 
{ 
    $user = login($_POST['pass']); 

    if ($user == null) 
    { 
        $error = "Invalid username or password."; 
    } 
    else 
    { 
        $_SESSION['pass'] = $user; 
    } 
} 


// redirect to index.php if logged in 
if (isset($_SESSION['pass']))
{
   session_start();
   header("Location: index.php");
}
else
{
   session_start();
   echo "<h1>Invalid User Name Or Password..</h1>";
   echo "<p>Click <a href=\"index.php\">here</a> to login..</p>";
}

?> 


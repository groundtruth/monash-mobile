<?php

session_start();

function getUsers() 
{ 
  $filepath = 'users.txt'; 
  $lines = @file($filepath) or die ('No users found!'); 
  $users= array(); 

  foreach ($lines as $number => $line) 
  { 
    $field = explode('|', $line); 
    $users[$number] = array("pass" => $field[0]); 
  } 

  return $users; 
} 

function logout() 
{ 
  if (session_start()) 
  { 
    session_destroy(); 

    return true; 
  } 

  return false; 
} 

function login($pass)
{
   $users = getUsers();
   foreach ($users as $u)
   {
      if ($pass === $u['pass'])
      {
         return $users;
      }
   }  
   return null;
}

?> 

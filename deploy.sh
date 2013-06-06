#!/bin/bash -x

ssh root@monash.pozi.com "cd /var/lib/tomcat6/webapps/monash-mobile && git pull origin master"


#!/bin/bash -x

ssh root@v3.pozi.com "cd /var/lib/tomcat6/webapps/monash-mobile && git pull origin master"

